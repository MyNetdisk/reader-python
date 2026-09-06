# Reader Python

基于 Python 技术栈的电子书阅读平台，采用 Monorepo 架构管理多个应用和共享包。

## 项目简介

Reader Python 是一个全栈电子书阅读平台，后端使用 FastAPI 构建高性能 API 服务，前端提供 Web、H5、App 多端覆盖，支持电子书的上传、解析、管理和在线阅读。

## 技术栈

| 层级      | 技术                        |
| ------- | ------------------------- |
| 后端框架    | FastAPI + SQLAlchemy      |
| 数据库     | MySQL                     |
| 前端（Web） | Vue 3 + Vite              |
| 前端（H5）  | Vue 3 + Vite              |
| 前端（App） | 待定                        |
| 包管理     | pnpm workspace            |
| 任务编排    | Turborepo                 |
| 语言      | Python 3.11+ / TypeScript |

## 项目架构

```
reader-python/
├── apps/
│   ├── backend/        # FastAPI 后端服务
│   ├── web/            # Web 端（Vue 3 + Vite）
│   ├── h5/             # H5 移动端（Vue 3 + Vite）
│   └── app/            # App 端
├── packages/
│   ├── api-types/      # 前后端共享的 API 类型定义
│   ├── utils/          # 共享工具函数
│   └── constants/      # 共享常量
├── db/                      # 本地 MySQL 配置与数据
│   ├── mysql/               # MySQL 解压文件（gitignore）
│   ├── data/                # 数据目录（gitignore）
│   └── my.ini               # MySQL 配置
├── docs/               # 项目文档
├── scripts/            # 开发/构建脚本
├── docker-compose.yml  # Docker 编排配置
├── turbo.json          # Turborepo 配置
├── pnpm-workspace.yaml # pnpm workspace 配置
└── package.json        # 根级依赖和脚本
```

### 架构说明

- **apps/**：存放各独立应用，每个子目录是一个可独立运行的服务或前端项目

- **packages/**：存放跨应用共享的代码包，通过 pnpm workspace 链接，无需发布即可互相引用

- **Turborepo**：负责任务编排，提供智能缓存和并行构建能力

更多架构细节见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

## 快速开始

项目提供 **两种独立的运行方式**，开发者可按需选择：

| 方式              | 适用场景       | 说明                                            |
| --------------- | ---------- | --------------------------------------------- |
| 方式一：本地开发模式      | 日常开发、调试    | 本机运行 Python / Node 进程，源码热重载，MySQL 由项目脚本自动拉起   |
| 方式二：Docker 一键部署 | 联调、演示、生产部署 | `docker compose` 一键拉起 db、backend、web，无需本机安装依赖 |

> ⚠️ 两种方式互斥，请勿同时运行（避免端口 3306/8000/5173 冲突）。

***

### 方式一：本地开发模式

**前置要求**：Python 3.11+、Node.js 18+、pnpm 9+

```bash
# 安装依赖
pnpm install

# 一键启动（自动启动 MySQL → 等待就绪 → 启动 backend + web）
pnpm dev
```

`pnpm dev` 会读取根目录 `db/my.ini` 启动本地 MySQL，确保 `reader` 库存在后再启动应用。退出时（Ctrl+C）自动停止 MySQL。

启动后访问：

- 前端：<http://localhost:5173>

- 后端健康检查：<http://localhost:8000/health>

> 完整搭建步骤（MySQL 安装、环境变量、数据库迁移）见 [docs/SETUP.md](./docs/SETUP.md)，本地 MySQL 配置见 [docs/MYSQL\_SETUP.md](./docs/MYSQL_SETUP.md)。

***

### 方式二：Docker 一键部署

**前置要求**：Docker 20.10+、Docker Compose v2+

```bash
docker compose up --build
```

一键拉起 `db` / `backend` / `web` 三个容器，服务间通过内部网络互通。

启动后访问：

- 前端：<http://localhost:5173>

- 后端健康检查：<http://localhost:8000/health>

> 服务拓扑、常用命令、自定义配置等详见 [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)。

***

## 常用命令

| 命令               | 说明                               |
| ---------------- | -------------------------------- |
| `pnpm dev`       | 本地开发（自动启动 MySQL + backend + web） |
| `pnpm build`     | 构建所有应用                           |
| `pnpm lint`      | 代码检查                             |
| `pnpm test`      | 运行测试                             |
| `pnpm db:start`  | 后台启动本地 MySQL                     |
| `pnpm db:stop`   | 停止本地 MySQL                       |
| `pnpm db:status` | 查看 MySQL 运行状态                    |

## 开发规范

- 所有命令通过 Turborepo 统一编排，根目录执行即可

- 共享代码放在 `packages/` 下，避免应用间直接引用

- 环境变量统一放在各应用根目录的 `.env` 文件中，参考 `.env.example`

- Docker 部署相关配置集中在根目录 `docker-compose.yml`，每个应用各自维护 Dockerfile

## 文档

更多详细文档见 [docs/](./docs/README.md)：

- [项目架构设计](./docs/ARCHITECTURE.md)

- [开发环境搭建指南](./docs/SETUP.md)

- [Docker 部署说明](./docs/DEPLOYMENT.md)

- [数据库设计规范](./docs/DATABASE.md)

- [本地 MySQL 安装与配置](./docs/MYSQL_SETUP.md)

## License

MIT
