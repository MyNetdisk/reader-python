/**
 * 本地开发编排脚本
 *
 * 启动顺序：MySQL 数据库 -> 等待就绪 -> 确保 reader 库存在 -> turbo run dev (backend + web)
 *
 * 用法：node scripts/dev.js
 *      pnpm dev   （已在根 package.json 中配置）
 *
 * 退出时（Ctrl+C）会自动停止本脚本启动的 MySQL 进程。
 * 如果 MySQL 已在运行（端口 3306 已被占用，例如作为 Windows 服务），则跳过启动直接复用。
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import {
  MYSQLD, MYSQL, MY_INI, ROOT,
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
  isPortOpen, waitForPort,
} from './db-utils.js';

// --- 带前缀转发子进程输出 ---
function pipeOutput(child, prefix) {
  const out = (data) => {
    const text = data.toString();
    for (const line of text.split(/\r?\n/)) {
      if (line) process.stdout.write(`${prefix} ${line}\n`);
    }
  };
  child.stdout && child.stdout.on('data', out);
  child.stderr && child.stderr.on('data', out);
}

// --- 启动 MySQL 并返回子进程（若已在运行则返回 null）---
async function startMysql() {
  if (await isPortOpen(DB_PORT, '127.0.0.1')) {
    console.log(`[dev] 检测到 ${DB_HOST}:${DB_PORT} 已被占用，MySQL 已在运行，跳过启动。`);
    return null;
  }

  if (!fs.existsSync(MYSQLD)) {
    console.error(`[dev] 未找到 MySQL 可执行文件：${MYSQLD}`);
    console.error('[dev] 请先按 docs/MYSQL_SETUP.md 说明将 MySQL 解压到 db/mysql/ 目录。');
    process.exit(1);
  }

  console.log('[dev] 启动 MySQL 数据库...');
  const mysqld = spawn(MYSQLD, [`--defaults-file=${MY_INI}`, '--console'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  pipeOutput(mysqld, '[mysql]');

  mysqld.on('exit', (code, signal) => {
    if (code !== 0 && signal === null) {
      console.error(`[dev] MySQL 进程退出，code=${code}`);
    }
  });

  return mysqld;
}

// --- 确保 reader 数据库存在 ---
async function ensureDatabase() {
  if (!fs.existsSync(MYSQL)) return; // 没有 mysql 客户端就跳过，由后端迁移自行处理
  return new Promise((resolve) => {
    const args = ['-h', DB_HOST, '-P', String(DB_PORT), '-u', DB_USER];
    const env = { ...process.env, MYSQL_PWD: DB_PASSWORD };
    const proc = spawn(
      MYSQL,
      [...args, '-e', `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`],
      { stdio: ['ignore', 'pipe', 'pipe'], env },
    );
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('exit', (code) => {
      if (code === 0) {
        console.log(`[dev] 已确保数据库 \`${DB_NAME}\` 存在。`);
      } else {
        console.warn(`[dev] 自动创建数据库失败（code=${code}），请手动确认 \`${DB_NAME}\` 库存在。`);
        if (stderr) process.stderr.write(stderr);
      }
      resolve();
    });
  });
}

async function main() {
  const mysqld = await startMysql();

  try {
    await waitForPort(DB_PORT, '127.0.0.1');
    console.log(`[dev] MySQL 已就绪（${DB_HOST}:${DB_PORT}）。`);
  } catch (err) {
    console.error('[dev] MySQL 启动失败：', err.message);
    if (mysqld) mysqld.kill();
    process.exit(1);
  }

  await ensureDatabase();

  console.log('[dev] 启动 backend + web（turbo run dev）...');
  const turbo = spawn('pnpm', ['turbo', 'run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: ROOT,
  });

  // 清理：退出时杀掉本脚本拉起的 MySQL 与 turbo
  const cleanup = () => {
    console.log('\n[dev] 正在关闭...');
    try { turbo.kill(); } catch (_) {}
    if (mysqld) {
      try { mysqld.kill(); } catch (_) {}
    }
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  turbo.on('exit', (code) => {
    if (mysqld) {
      try { mysqld.kill(); } catch (_) {}
    }
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error('[dev] 启动失败：', err);
  process.exit(1);
});
