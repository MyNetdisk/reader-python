#  Reader Python

基于 Python 技术栈的电子书阅读平台，采用 Monorepo 架构管理多个应用和共享包。

## 项目简介

Reader Python 是一个全栈电子书阅读平台，后端使用 FastAPI 构建高性能 API 服务，前端提供 Web、H5、App 多端覆盖，支持电子书的上传、解析、管理和在线阅读。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | FastAPI + SQLAlchemy |
| 数据库 | MySQL |
| 前端（Web） | Vue 3 + Vite |
| 前端（H5） | Vue 3 + Vite |
| 前端（App） | 待定 |
| 包管理 | pnpm workspace |
| 任务编排 | Turborepo |
| 语言 | Python 3.11+ / TypeScript |

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
├── docker/             # Docker 相关配置
├── docs/               # 项目文档
├── scripts/            # 构建/部署脚本
├── turbo.json          # Turborepo 配置
├── pnpm-workspace.yaml # pnpm workspace 配置
└── package.json        # 根级依赖和脚本
```

### 架构说明

- **apps/**：存放各独立应用，每个子目录是一个可独立运行的服务或前端项目
- **packages/**：存放跨应用共享的代码包，通过 pnpm workspace 链接，无需发布即可互相引用
- **Turborepo**：负责任务编排，提供智能缓存和并行构建能力

## 快速开始

项目提供 **两种独立的运行方式**，开发者可按需选择：

| 方式 | 适用场景 | 说明 |
|------|---------|------|
| 方式一：本地开发模式 | 日常开发、调试 | 直接在本机运行 Python / Node 进程，源码改动热重载，需自行准备 MySQL |
| 方式二：Docker 一键部署 | 联调、演示、生产部署 | 通过 `docker compose` 一键拉起 db、backend、web 三个容器，内部网络互通，无需本机安装 Python/Node/MySQL |

> ⚠️ 两种方式互斥，请勿同时运行（避免端口 3306/8000/5173 冲突）。

---

### 方式一：本地开发模式

#### 前置要求

- Python 3.11+
- Node.js 18+
- pnpm 9+
- MySQL 8.0+（本地实例或远程实例均可）

#### 安装依赖

```bash
pnpm install
```

#### 配置环境变量

在 `apps/backend/` 下复制 `.env.example` 为 `.env`，按本机 MySQL 配置修改：

```bash
cp apps/backend/.env.example apps/backend/.env
```

#### 启动开发环境

```bash
# 启动所有应用（并行）
pnpm run dev

# 仅启动后端
pnpm turbo run dev --filter=backend

# 仅启动 Web 端
pnpm turbo run dev --filter=web
```

启动后：
- 前端：http://localhost:5173 （Vite 已将 `/api` 代理到 `http://localhost:8000`）
- 后端：http://localhost:8000
- 后端健康检查：http://localhost:8000/health

#### 数据库迁移

首次启动或后端模型有变更时执行：

```bash
pnpm --filter backend migrate
# 或
cd apps/backend && alembic upgrade head
```

#### 构建

```bash
# 构建所有应用
pnpm run build

# 仅构建指定应用
pnpm turbo run build --filter=web
```

#### 代码检查 / 测试

```bash
pnpm run lint
pnpm run test
```

---

### 方式二：Docker 一键部署

#### 前置要求

- Docker 20.10+
- Docker Compose v2+（已内置 `docker compose` 子命令）

无需本机安装 Python / Node / pnpm / MySQL，全部由容器提供。

#### 一键启动

在项目根目录执行：

```bash
docker compose up --build
```

`docker-compose.yml` 中定义了三个服务，启动顺序由 `depends_on` + `healthcheck` 自动保证：

| 启动顺序 | 服务 | 镜像/构建 | 主机端口 | 容器内端口 | 依赖 |
|---------|------|----------|---------|----------|------|
| 1 | `db` | `mysql:8.0` | 3306 | 3306 | — |
| 2 | `backend` | `apps/backend/Dockerfile` | 8000 | 8000 | db healthy |
| 3 | `web` | `apps/web/Dockerfile` | 5173 | 80 | backend healthy |

三个服务接入同一个 `appnet` 桥接网络，**通过服务名直接互通**：

- backend → db：`DATABASE_URL=mysql+aiomysql://root:password@db:3306/reader`（主机名为 `db`）
- web → backend：nginx 将 `/api/` 反向代理到 `http://backend:8000`（主机名为 `backend`）

启动后访问：
- 前端：http://localhost:5173
- 后端健康检查：http://localhost:8000/health

#### 数据库迁移（首次启动后执行一次）

```bash
docker compose exec backend alembic upgrade head
```

#### 常用命令

```bash
# 后台启动
docker compose up -d --build

# 查看日志
docker compose logs -f backend
docker compose logs -f web

# 进入容器
docker compose exec backend bash
docker compose exec db mysql -uroot -ppassword reader

# 停止并清理容器（保留数据卷）
docker compose down

# 停止并清空数据（慎用，会删除数据库数据）
docker compose down -v
```

#### 自定义配置

如需修改数据库密码、端口等，编辑根目录 `docker-compose.yml` 中对应服务的 `environment` / `ports` 字段。修改 backend 的环境变量后需同步确认 `apps/web/nginx.conf` 中的代理目标与 `apps/backend/app/core/config.py` 的字段名一致。

更多细节见 [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)。

---

## 开发规范

- 所有命令通过 Turborepo 统一编排，根目录执行即可
- 共享代码放在 `packages/` 下，避免应用间直接引用
- 环境变量统一放在各应用根目录的 `.env` 文件中，参考 `.env.example`
- Docker 部署相关配置集中在根目录 `docker-compose.yml`，每个应用各自维护 Dockerfile

## License

MIT