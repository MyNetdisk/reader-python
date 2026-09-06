### MySQL 免安装版（ZIP）完整配置教程

#### 第一步：下载与解压

1. 前往 MySQL 官网下载页面，选择 **MySQL Community Server**
2. 操作系统选 **Microsoft Windows**
3. 下载 **ZIP Archive** 版本（如 `mysql-8.0.xx-winx64.zip`），**不要选 MSI Installer**
4. 将 ZIP 文件解压到项目的 `db/mysql/` 目录下

解压后目录结构如下：
```text
db/
└── mysql/
    ├── bin/          ← MySQL 可执行文件
    ├── lib/
    ├── share/
    ├── docs/
    └── ...
```

> ⚠️ 解压路径中**不要有中文、空格和特殊字符**，否则可能导致启动失败。

---

#### 第二步：创建配置文件 `my.ini`

在 `db/` 目录下（与 `mysql/` 同级）新建 `my.ini` 文件，内容如下（**请将路径替换为你的实际项目路径**）：

```ini
[mysqld]
# MySQL 安装目录（解压后的根目录）
basedir=C:/Users/MyNetdisk/Documents/Project/ebook-platform/reader-python/db/mysql
# 数据存放目录（初始化时自动生成，无需手动创建）
datadir=C:/Users/MyNetdisk/Documents/Project/ebook-platform/reader-python/db/data
# 端口
port=3306
# 字符集（推荐 utf8mb4，支持 emoji）
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
# 默认存储引擎
default-storage-engine=INNODB
# 最大连接数
max_connections=200

[mysql]
# MySQL 客户端字符集
default-character-set=utf8mb4

[client]
# 客户端连接端口和字符集
port=3306
default-character-set=utf8mb4
```

> ⚠️ 注意事项：
> - 路径分隔符用**正斜杠 `/`** 或**双反斜杠 `\\`**，不要用单反斜杠 `\`
> - 文件编码保存为 **ANSI** 或 **UTF-8 无 BOM**，用记事本保存为 UTF-8 带 BOM 可能导致 "unknown option" 错误

---

#### 第三步：初始化数据库

1. 按 `Win + S` 搜索 **cmd**，右键选择 **"以管理员身份运行"**
2. 进入 MySQL 的 `bin` 目录并执行初始化命令：

```bash
cd C:\Users\MyNetdisk\Documents\Project\ebook-platform\reader-python\db\mysql\bin

mysqld --defaults-file="C:\Users\MyNetdisk\Documents\Project\ebook-platform\reader-python\db\my.ini" --initialize-insecure --console
```

> ⚠️ **关键**：初始化时必须通过 `--defaults-file` 指定配置文件路径，否则 MySQL 会忽略 `my.ini` 中的 `datadir` 配置，将 `data` 目录默认创建在 `mysql/` 内部而非与 `mysql/` 同级。

执行后控制台会输出日志，看到类似以下内容表示初始化成功：
```
[Note] [MY-010454] A temporary password is generated for root@localhost: ...
```

> 执行成功后，`db/data/` 目录会自动生成在 `db/` 下（与 `mysql/` 同级），里面包含数据库的系统文件。

---

#### 第四步：注册为 Windows 服务

仍在管理员 CMD 中执行：

```bash
mysqld --install MySQL_Reader --defaults-file="C:\Users\MyNetdisk\Documents\Project\ebook-platform\reader-python\db\my.ini"
```

看到 `Service successfully installed.` 表示注册成功。

> ⚠️ `--defaults-file` 参数**不要省略**，否则 MySQL 会忽略你的自定义配置而使用内置默认值。

---

#### 第五步：启动服务

```bash
net start MySQL_Reader
```

看到 `MySQL_Reader 服务已经启动成功。` 表示启动成功。

> ⚠️ 如果服务启动失败，常见原因是 Windows 服务以 `SYSTEM` 账户运行，可能没有权限访问 `C:\Users\...` 下的用户目录。此时可将 `db` 目录移到非用户目录（如 `C:\db\`），或改用前台命令运行：
> ```bash
> mysqld --defaults-file="...\my.ini" --console
> ```
> 窗口保持打开即可，另开 CMD 执行 `mysql -u root -p` 连接。

---

#### 第六步：登录并修改密码

```bash
mysql -u root -p
```

- 如果第三步用的是 `--initialize`，输入记下的临时密码
- 如果用的是 `--initialize-insecure`，直接按回车（空密码）

登录成功后，修改 root 密码：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '你的新密码';
FLUSH PRIVILEGES;
EXIT;
```

---

#### 第七步：配置环境变量（可选）

这样可以在任意位置直接使用 `mysql` 命令，不用每次都进入 `bin` 目录。

1. 右键 **"此电脑"** → **属性** → **高级系统设置** → **环境变量**
2. 在 **系统变量** 中新建：
   - 变量名：`MYSQL_HOME`
   - 变量值：`C:\Users\MyNetdisk\Documents\Project\ebook-platform\reader-python\db\mysql`
3. 编辑系统变量中的 `Path`，新增一条：
   - `%MYSQL_HOME%\bin`
4. 确定保存，**重新打开** CMD 窗口即可生效

---

#### 第八步：验证安装

```bash
mysql --version
```

输出类似 `mysql  Ver 8.0.xx for Win64 on x86_64 (MySQL Community Server)` 即表示安装成功。

---

### 最终目录结构

```text
reader-python/
├── db/
│   ├── mysql/              ← MySQL 解压文件
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── share/
│   │   └── ...
│   ├── data/               ← 初始化后自动生成（与 mysql/ 同级）
│   └── my.ini              ← 配置文件（与 mysql/ 同级）
└── ...
```

---

### 常用命令速查

| 操作 | 命令 |
| :--- | :--- |
| 启动服务 | `net start MySQL_Reader` |
| 停止服务 | `net stop MySQL_Reader` |
| 登录 MySQL | `mysql -u root -p` |
| 卸载服务 | 先 `net stop MySQL_Reader`，再 `mysqld --remove MySQL_Reader` |

---

### 常见问题排查

| 问题 | 解决方案 |
| :--- | :--- |
| 缺少 `VCRUNTIME140.dll` | 安装 Visual C++ Redistributable |
| 端口 3306 被占用 | 修改 `my.ini` 中的 `port` 为其他端口（如 3307） |
| 服务启动失败 | 检查 `my.ini` 路径是否正确、是否以管理员身份运行 |
| `data` 目录位置不对 | 初始化时必须加 `--defaults-file` 参数指定配置文件 |
| 忘记密码 | 停止服务 → `my.ini` 的 `[mysqld]` 下添加 `skip-grant-tables` → 启动服务 → 免密登录 → 重置密码 → 删除该配置 → 重启服务 |

---

### 踩坑总结

本次安装过程中遇到的核心问题：**初始化时未指定 `--defaults-file` 参数**，导致 MySQL 没有读取 `my.ini` 中的 `datadir` 配置，将 `data` 目录创建在了 `mysql/` 内部而非与 `mysql/` 同级，进而导致服务启动失败。

**教训**：凡是涉及 `mysqld` 的命令（初始化、注册服务、启动），都应显式指定 `--defaults-file` 参数，确保 MySQL 读取正确的配置文件。