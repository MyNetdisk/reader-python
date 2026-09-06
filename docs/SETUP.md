# 🛠️ 开发环境搭建指南

本文档指导你在本地完成 Reader Python 项目的开发环境搭建。

## 目录

- [1. 前置要求](#1-前置要求)
- [2. 安装依赖](#2-安装依赖)
- [3. 配置数据库](#3-配置数据库)
- [4. 配置环境变量](#4-配置环境变量)
- [5. 数据库迁移](#5-数据库迁移)
- [6. 启动开发环境](#6-启动开发环境)
- [7. 验证](#7-验证)
- [8. 常见问题](#8-常见问题)

---

## 1. 前置要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Python | 3.11+ | 后端运行时 |
| Node.js | 18+ | 前端与构建工具 |
| pnpm | 9+ | 包管理器 |
| MySQL | 8.0+ | 项目已内置本地配置，见第 3 节 |

确认环境：

```bash
python --version
node --version
pnpm --version
```

## 2. 安装依赖

在项目根目录执行：

```bash
pnpm install
```

安装后端 Python 依赖：

```bash
pip install -r apps/backend/requirements.txt
```

> 建议使用虚拟环境（如 `venv` 或 `conda`）隔离 Python 依赖。

## 3. 配置数据库

项目在根目录 `db/` 下预置了 MySQL 配置（`my.ini`），支持免安装 ZIP 版 MySQL，无需全局安装。

- **首次使用**：需下载 MySQL 8.0 ZIP 并解压到 `db/mysql/`，完整步骤见 [MYSQL_SETUP.md](./MYSQL_SETUP.md)。
- **数据库表结构设计**：见 [DATABASE.md](./DATABASE.md)。

`db/` 目录结构：

```text
db/
├── mysql/     ← MySQL 解压文件（自行下载，已 gitignore）
├── data/      ← 数据目录（初始化后自动生成，已 gitignore）
└── my.ini     ← MySQL 配置文件
```

### 数据库管理命令

```bash
# 后台启动 MySQL（自动读取 db/my.ini，等待 3306 就绪）
pnpm db:start

# 查看运行状态
pnpm db:status

# 停止 MySQL
pnpm db:stop
```

> 也可跳过单独启动，直接 `pnpm dev` 会自动拉起 MySQL。详见 [MYSQL_SETUP.md](./MYSQL_SETUP.md)。

## 4. 配置环境变量

后端通过 `apps/backend/.env` 读取数据库连接配置。复制示例文件：

```bash
cp apps/backend/.env.example apps/backend/.env
```

默认配置（与 `db/my.ini` 一致即可）：

```env
DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/reader
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=reader
```

> ⚠️ 若修改了 MySQL 端口或密码，需同步更新此处。

## 5. 数据库迁移

首次启动或模型变更后，执行迁移创建表结构：

```bash
cd apps/backend
python -m alembic upgrade head
```

> 必须用 `python -m alembic`，直接执行 `alembic` 会报 `ModuleNotFoundError: No module named 'app'`。

生成新迁移：

```bash
python -m alembic revision --autogenerate -m "描述"
```

## 6. 启动开发环境

### 一键启动（推荐）

```bash
pnpm dev
```

`scripts/dev.js` 会按顺序自动编排：

```
启动 MySQL → 等待 3306 就绪 → 确保 reader 库存在 → 启动 backend + web
```

退出时（Ctrl+C）自动停止本脚本拉起的 MySQL 进程。

### 单独启动

```bash
# 仅后端（需先确保 MySQL 已运行）
pnpm turbo run dev --filter=backend

# 仅 Web 端
pnpm turbo run dev --filter=web
```

## 7. 验证

启动成功后访问：

| 服务 | 地址 |
|------|------|
| Web 前端 | http://localhost:5173 |
| 后端 API | http://localhost:8000 |
| 后端健康检查 | http://localhost:8000/health |
| API 文档 | http://localhost:8000/docs |

验证数据库连接：

```bash
curl http://localhost:8000/api/v1/books/
# 返回 [] 表示连接正常
```

## 8. 常见问题

| 问题 | 解决方案 |
|------|---------|
| `ModuleNotFoundError: No module named 'app'` | 用 `python -m alembic` 代替 `alembic` |
| 后端报 `Can't connect to MySQL` | 确认 MySQL 已启动：`pnpm db:status` |
| `Access denied for user 'root'` | 确认 root 密码与 `apps/backend/.env` 中 `DATABASE_PASSWORD` 一致 |
| `Table 'reader.books' doesn't exist` | 执行数据库迁移：`cd apps/backend && python -m alembic upgrade head` |
| 端口 3306 被占用 | 修改 `db/my.ini` 的 `port` 与 `apps/backend/.env` 的 `DATABASE_PORT` |

更多 MySQL 相关问题见 [MYSQL_SETUP.md](./MYSQL_SETUP.md#常见问题排查)。
