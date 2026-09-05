# 🐳 Docker 部署说明

本文档说明如何使用 Docker Compose 一键拉起 Reader Python 的 **数据库 / 后端 / 前端** 三个服务。

## 与本地开发模式的区别

| 维度 | 本地开发模式 | Docker 部署 |
|------|------------|-----------|
| 运行载体 | 本机直接运行 Python / Node 进程 | 容器内运行 |
| 依赖安装 | 需本机准备 Python、Node、pnpm、MySQL | 仅需 Docker |
| 热重载 | 支持（`--reload` / Vite HMR） | 默认不支持（生产模式） |
| 服务互通 | `localhost:port` | 容器间通过服务名访问 |
| 数据库 | 自备 | 容器提供，数据持久化到卷 |
| 适用场景 | 日常开发调试 | 联调、演示、CI、生产 |

> ⚠️ 两种方式互斥，请勿同时运行，避免端口 3306 / 8000 / 5173 冲突。

## 前置要求

- Docker 20.10+
- Docker Compose v2+（已内置 `docker compose` 子命令）
- 主机端口未被占用：`3306`（MySQL）、`8000`（backend）、`5173`（web）

## 文件结构

```
reader-python/
├── docker-compose.yml        # 根级编排，定义 db / backend / web 三个服务
├── .dockerignore             # web 构建上下文忽略项
├── apps/
│   ├── backend/
│   │   ├── Dockerfile        # 后端镜像：python:3.11-slim + uvicorn
│   │   └── .dockerignore
│   └── web/
│       ├── Dockerfile        # 前端镜像：node:22-slim 构建 + nginx:1.27-alpine 运行
│       └── nginx.conf        # nginx 配置：SPA 兜底 + /api 反代到 backend
```

## 服务拓扑

启动顺序：`db → backend → web`（由 `depends_on` + `healthcheck` 强制保证）

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   web:80    │────▶│ backend:8000 │────▶│  db:3306    │
│  (nginx)    │ /api │  (FastAPI)   │ SQL │  (MySQL 8)  │
└─────────────┘     └──────────────┘     └─────────────┘
   ↑ :5173             ↑ :8000              ↑ :3306
   主机端口            主机端口              主机端口
                   全部接入 appnet 桥接网络
```

| 服务 | 内部主机名 | 内部端口 | 主机映射端口 |
|------|-----------|---------|-------------|
| MySQL | `db` | 3306 | 3306 |
| FastAPI | `backend` | 8000 | 8000 |
| nginx | `web` | 80 | 5173 |

- backend 通过 `DATABASE_HOST=db` 连接数据库
- web 容器内 nginx 将 `/api/` 反向代理到 `http://backend:8000`

## 快速启动

在项目根目录执行：

```bash
docker compose up --build
```

首次启动会拉取基础镜像并构建 backend / web 镜像，耗时较长。后续启动复用缓存。

启动后：
- 前端：http://localhost:5173
- 后端健康检查：http://localhost:8000/health

## 数据库初始化

容器首次启动会自动创建 `reader` 数据库（由 `MYSQL_DATABASE` 环境变量控制），但 **不会自动执行 Alembic 迁移**。需手动执行一次：

```bash
docker compose exec backend alembic upgrade head
```

查看迁移状态：

```bash
docker compose exec backend alembic current
```

## 常用命令

```bash
# 后台启动
docker compose up -d --build

# 查看实时日志
docker compose logs -f
docker compose logs -f backend
docker compose logs -f web

# 查看容器状态
docker compose ps

# 进入容器
docker compose exec backend bash
docker compose exec web sh
docker compose exec db mysql -uroot -ppassword reader

# 停止并清理容器（保留数据卷 db_data）
docker compose down

# 停止并清空数据（⚠️ 会删除所有数据库数据）
docker compose down -v
```

## 配置自定义

### 修改数据库密码

编辑 `docker-compose.yml` 中 `db` 和 `backend` 两个服务的环境变量（必须同步）：

```yaml
db:
  environment:
    MYSQL_ROOT_PASSWORD: <新密码>
backend:
  environment:
    DATABASE_PASSWORD: <新密码>
    DATABASE_URL: mysql+aiomysql://root:<新密码>@db:3306/reader
```

修改后需重建容器：

```bash
docker compose up -d --build --force-recreate
```

### 修改主机映射端口

例如把前端改到 8080：

```yaml
web:
  ports:
    - "8080:80"
```

### 修改后端 API 代理目标

如 backend 容器名或端口调整，需同步修改 `apps/web/nginx.conf` 中的 `proxy_pass http://backend:8000;`。

## 数据持久化

MySQL 数据通过 Docker 命名卷 `db_data` 持久化。`docker compose down` 不会删除数据卷，只有 `docker compose down -v` 或 `docker volume rm` 才会清除数据。

备份：

```bash
docker compose exec db mysqldump -uroot -ppassword reader > backup.sql
```

恢复：

```bash
docker compose exec -T db mysql -uroot -ppassword reader < backup.sql
```

## 故障排查

| 现象 | 排查 |
|------|------|
| `web` 容器启动后 502 | 检查 backend 是否健康：`docker compose ps`，确认 backend 状态为 `healthy` |
| backend 日志报 `Can't connect to MySQL` | db 健康检查未通过，检查 `docker compose logs db`；首次启动 MySQL 初始化可能需要 10-20 秒 |
| 端口被占用 | `docker compose down` 停掉旧容器，或修改 `docker-compose.yml` 的端口映射 |
| `web` 构建时 `pnpm install` 失败 | 检查 `pnpm-lock.yaml` 是否与 `package.json` 同步，本机执行 `pnpm install` 后重新提交 |
| 容器间无法互通 | 确认三个服务都在 `appnet` 网络上，`docker network inspect reader-python_appnet` 查看 |

## 与本地开发的切换

从 Docker 模式切回本地开发：

```bash
docker compose down
pnpm install
pnpm run dev
```

从本地开发切到 Docker 模式：

```bash
# 停掉本地的 backend (8000) / web (5173) / 本地 MySQL (3306)
docker compose up --build
```
