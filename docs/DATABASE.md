# 🗃️ 数据库设计规范

本文档描述 Reader Python 项目的数据库表结构、字段定义与设计约定。

> 本地 MySQL 的安装与配置见 [MYSQL_SETUP.md](./MYSQL_SETUP.md)。

## 概述

| 项目 | 值 |
|------|-----|
| 数据库类型 | MySQL 8.0 |
| 字符集 | utf8mb4 |
| 排序规则 | utf8mb4_unicode_ci |
| 存储引擎 | InnoDB |
| 数据库名 | reader |
| ORM | SQLAlchemy 2.0（异步） |
| 迁移工具 | Alembic |

## 命名约定

- 表名：小写蛇形命名（snake_case），使用复数形式，如 `books`
- 字段名：小写蛇形命名，如 `created_at`
- 主键：统一命名 `id`，自增整数
- 时间字段：`created_at`（创建时间）、`updated_at`（更新时间），由数据库默认值维护
- 索引：外键字段与高频查询字段建立索引

## 表结构

### books —— 电子书表

存储电子书的基本元数据。

| 字段 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | INT | PK, AUTO_INCREMENT | — | 主键 |
| `title` | VARCHAR(255) | NOT NULL | — | 书名 |
| `author` | VARCHAR(255) | NOT NULL | — | 作者 |
| `description` | TEXT | NULL | NULL | 简介 |
| `cover_url` | VARCHAR(500) | NULL | NULL | 封面地址 |
| `created_at` | DATETIME | NOT NULL | `now()` | 创建时间 |
| `updated_at` | DATETIME | NOT NULL | `now()` | 更新时间 |

建表 SQL（由 Alembic 迁移自动生成）：

```sql
CREATE TABLE books (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '书名',
    author VARCHAR(255) NOT NULL COMMENT '作者',
    description TEXT NULL COMMENT '简介',
    cover_url VARCHAR(500) NULL COMMENT '封面地址',
    created_at DATETIME NOT NULL DEFAULT now() COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT now() COMMENT '更新时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 模型定义

对应 SQLAlchemy 模型位于 `apps/backend/app/models/book.py`：

```python
class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, comment="书名")
    author: Mapped[str] = mapped_column(String(255), nullable=False, comment="作者")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="简介")
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True, comment="封面地址")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
```

## 数据库迁移

迁移脚本位于 `apps/backend/alembic/versions/`。

```bash
# 生成迁移（模型变更后）
cd apps/backend && python -m alembic revision --autogenerate -m "描述"

# 执行迁移
cd apps/backend && python -m alembic upgrade head

# 回滚一个版本
cd apps/backend && python -m alembic downgrade -1
```

> ⚠️ `alembic` 控制台脚本不会将当前目录加入 `sys.path`，需用 `python -m alembic` 运行，否则会报 `ModuleNotFoundError: No module named 'app'`。

### 当前迁移版本

| Revision | 说明 |
|----------|------|
| `c00cdff2e435` | init：创建 `books` 表 |
