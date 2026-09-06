# 🏗️ 项目架构设计

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端框架 | FastAPI + SQLAlchemy 2.0 | 异步 API + ORM |
| 数据库 | MySQL 8.0 | 主数据库，Alembic 管理迁移 |
| 前端（Web） | Vue 3 + Vite | Web 管理端 |
| 前端（H5） | Vue 3 + Vite | H5 移动端 |
| 包管理 | pnpm workspace | Monorepo 依赖管理 |
| 任务编排 | Turborepo | 构建/开发任务缓存与并行 |
| 语言 | Python 3.11+ / TypeScript | 后端 Python，前端 TypeScript |

## 目录结构

```
reader-python/
├── apps/                    # 独立应用
│   ├── backend/             # FastAPI 后端服务
│   │   ├── app/
│   │   │   ├── api/         # 路由层
│   │   │   ├── core/        # 配置、数据库连接
│   │   │   ├── models/      # SQLAlchemy 模型
│   │   │   ├── schemas/     # Pydantic 数据模型
│   │   │   └── services/    # 业务逻辑
│   │   ├── alembic/         # 数据库迁移
│   │   ├── .env.example
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── web/                 # Web 端（Vue 3 + Vite）
│   ├── h5/                  # H5 移动端（Vue 3 + Vite）
│   └── app/                 # App 端（预留）
├── packages/                # 跨应用共享包
│   ├── api-types/           # 前后端共享的 API 类型定义
│   ├── utils/               # 共享工具函数
│   └── constants/           # 共享常量
├── db/                      # 本地 MySQL 配置与数据
│   ├── mysql/               # MySQL 解压文件（gitignore）
│   ├── data/                # 数据目录（gitignore）
│   └── my.ini               # MySQL 配置
├── docs/                    # 项目文档
├── scripts/                 # 开发/构建脚本
│   ├── dev.js               # 本地开发编排（启动 MySQL + 应用）
│   ├── db-start.js          # 后台启动 MySQL
│   ├── db-stop.js           # 停止 MySQL
│   └── db-status.js         # 查看 MySQL 状态
├── docker-compose.yml       # Docker 编排（db / backend / web）
├── turbo.json               # Turborepo 任务配置
├── pnpm-workspace.yaml      # pnpm workspace 配置
└── package.json             # 根级依赖和脚本
```

## 模块职责

### apps/

存放各独立应用，每个子目录可独立开发、构建、部署。

| 应用 | 职责 |
|------|------|
| `backend` | FastAPI 后端，提供 RESTful API，连接 MySQL 数据库 |
| `web` | Web 管理端，Vue 3 + Vite，通过 `/api` 代理访问后端 |
| `h5` | H5 移动端（预留） |
| `app` | App 端（预留） |

### packages/

存放跨应用共享的代码包，通过 pnpm workspace 链接，无需发布即可在 `apps/*` 中引用。

| 包 | 职责 |
|----|------|
| `api-types` | 前后端共享的 API 请求/响应类型定义 |
| `utils` | 通用工具函数（日期、字符串、校验等） |
| `constants` | 跨应用共享常量 |

## 后端分层

`apps/backend` 采用经典分层架构：

```
api/        路由层：定义 HTTP 端点，参数校验，调用 service
services/   业务逻辑层：封装业务规则，操作数据库
models/     数据模型层：SQLAlchemy ORM 模型，对应数据库表
schemas/    数据传输层：Pydantic 模型，定义请求/响应结构
core/       基础设施层：配置、数据库连接、通用依赖
```

请求流转：`HTTP 请求 → api → services → models → MySQL`

## 数据库

- 使用 MySQL 8.0，字符集 utf8mb4
- ORM：SQLAlchemy 2.0（异步）
- 迁移：Alembic，迁移脚本位于 `apps/backend/alembic/versions/`
- 表结构设计见 [DATABASE.md](./DATABASE.md)

## 任务编排（Turborepo）

根目录 `turbo.json` 定义任务依赖：

- `build`：依赖 `^build`（先构建依赖包）
- `dev`：持久任务，支持热重载
- `test`：依赖 `build`

所有命令在根目录执行即可，Turborepo 负责按依赖关系调度。

## 两种运行方式

| 方式 | 说明 | 文档 |
|------|------|------|
| 本地开发 | 本机运行，`pnpm dev` 自动拉起 MySQL + 应用 | [SETUP.md](./SETUP.md) |
| Docker 部署 | `docker compose` 一键拉起全部服务 | [DEPLOYMENT.md](./DEPLOYMENT.md) |
