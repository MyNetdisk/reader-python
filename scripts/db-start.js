/**
 * 以后台方式启动本地 MySQL，并写入 PID 文件供 db:stop 使用。
 * 用法：pnpm db:start
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { MYSQLD, MY_INI, PID_FILE, DB_PORT, isPortOpen, waitForPort } from './db-utils.js';

async function main() {
  if (await isPortOpen(DB_PORT, '127.0.0.1')) {
    console.log(`[db:start] 端口 ${DB_PORT} 已被占用，MySQL 似乎已在运行。`);
    console.log('[db:start] 如需停止，请运行 pnpm db:stop（若为 Windows 服务请用 net stop）。');
    return;
  }

  if (!fs.existsSync(MYSQLD)) {
    console.error(`[db:start] 未找到 MySQL：${MYSQLD}`);
    console.error('[db:start] 请先按 docs/DATABASE.md 解压 MySQL 到 db/mysql/。');
    process.exit(1);
  }

  console.log('[db:start] 以后台方式启动 MySQL...');
  const mysqld = spawn(MYSQLD, [`--defaults-file=${MY_INI}`, '--console'], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  });
  mysqld.unref();

  fs.writeFileSync(PID_FILE, String(mysqld.pid), 'utf8');
  console.log(`[db:start] MySQL PID=${mysqld.pid}，PID 文件：${PID_FILE}`);

  try {
    await waitForPort(DB_PORT, '127.0.0.1');
    console.log(`[db:start] MySQL 已就绪（127.0.0.1:${DB_PORT}）。`);
  } catch (err) {
    console.error('[db:start] 启动失败：', err.message);
    try { process.kill(mysqld.pid); } catch (_) {}
    try { fs.unlinkSync(PID_FILE); } catch (_) {}
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
