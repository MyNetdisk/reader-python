/**
 * 停止由 pnpm db:start 启动的本地 MySQL（按 PID 文件）。
 * 若 MySQL 以 Windows 服务方式运行，请使用 net stop MySQL_Reader。
 * 用法：pnpm db:stop
 */
import fs from 'node:fs';
import { PID_FILE, DB_PORT, isPortOpen } from './db-utils.js';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  if (!fs.existsSync(PID_FILE)) {
    console.log('[db:stop] 未找到 PID 文件，无法停止（可能由 Windows 服务或其它方式启动）。');
    console.log('[db:stop] 若为 Windows 服务，请执行：net stop MySQL_Reader');
    process.exit(0);
  }

  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
  if (!pid) {
    console.error('[db:stop] PID 文件内容无效。');
    process.exit(1);
  }

  try {
    process.kill(pid);
    console.log(`[db:stop] 已发送终止信号给 PID=${pid}。`);
  } catch (err) {
    if (err.code === 'ESRCH') {
      console.log(`[db:stop] PID=${pid} 不存在，进程可能已退出。`);
    } else {
      console.error('[db:stop] 终止进程失败：', err.message);
      process.exit(1);
    }
  }

  // 等待端口释放（最多 10 秒）
  for (let i = 0; i < 10; i++) {
    if (!(await isPortOpen(DB_PORT, '127.0.0.1'))) break;
    await sleep(1000);
  }

  const stillOpen = await isPortOpen(DB_PORT, '127.0.0.1');
  if (stillOpen) {
    console.warn(`[db:stop] 端口 ${DB_PORT} 仍被占用，可能存在其它 MySQL 实例。`);
  } else {
    console.log(`[db:stop] MySQL 已停止（端口 ${DB_PORT} 已释放）。`);
  }

  try { fs.unlinkSync(PID_FILE); } catch (_) {}
}

main().catch((err) => { console.error(err); process.exit(1); });
