/**
 * 数据库相关公共工具（路径、端口检测、.env 解析）
 */
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export const MYSQLD = path.join(ROOT, 'db', 'mysql', 'bin', 'mysqld.exe');
export const MYSQL = path.join(ROOT, 'db', 'mysql', 'bin', 'mysql.exe');
export const MY_INI = path.join(ROOT, 'db', 'my.ini');
export const PID_FILE = path.join(ROOT, 'db', '.mysqld.pid');
export const BACKEND_ENV = path.join(ROOT, 'apps', 'backend', '.env');

export function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const backendEnv = loadEnv(BACKEND_ENV);
export const DB_HOST = backendEnv.DATABASE_HOST || 'localhost';
export const DB_PORT = parseInt(backendEnv.DATABASE_PORT || '3306', 10);
export const DB_USER = backendEnv.DATABASE_USER || 'root';
export const DB_PASSWORD = backendEnv.DATABASE_PASSWORD || 'password';
export const DB_NAME = backendEnv.DATABASE_NAME || 'reader';

export function isPortOpen(port, host, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => { socket.destroy(); resolve(false); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

export function waitForPort(port, host, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async () => {
      if (await isPortOpen(port, host)) { resolve(); return; }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`等待 ${host}:${port} 超时（${timeoutMs}ms）`));
        return;
      }
      setTimeout(check, 1000);
    };
    check();
  });
}
