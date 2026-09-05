// # 校验相关工具

export function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export function isPhone(str: string): boolean {
  return /^1[3-9]\d{9}$/.test(str);
}