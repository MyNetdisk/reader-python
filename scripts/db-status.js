/**
 * 检查本地 MySQL 是否在运行。
 * 用法：pnpm db:status
 */
import fs from 'node:fs';
import { PID_FILE, DB_PORT, DB_HOST, isPortOpen } from './db-utils.js';

async function main() {
  const open = await isPortOpen(DB_PORT, '127.0.0.1');
  if (open) {
    console.log(`[db:status] MySQL 正在运行（${DB_HOST}:${DB_PORT} 可连接）。`);
  } else {
    console.log(`[db:status] MySQL 未运行（${DB_HOST}:${DB_PORT} 不可连接）。`);
  }
  if (fs.existsSync(PID_FILE)) {
    const pid = fs.readFileSync(PID_FILE, 'utf8').trim();
    console.log(`[db:status] PID 文件记录：${pid}`);
  } else {
    console.log('[db:status] 未找到 PID 文件（可能由 Windows 服务或其它方式启动）。');
  }
  process.exit(open ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(1); });
