# 人事管理花名册

一个可直接启动的最小可用版本，包含：

- 产品方案文档
- 前端花名册页面
- 后端人员 CRUD 接口
- SQLite 数据库初始化与持久化
- Docker 一键部署配置

## 目录结构

- `docs/product-plan.md`：完整产品方案、前后端与数据库设计
- `backend`：Express + SQLite 后端
- `frontend`：React + TypeScript 前端

## 启动方式

### 开发环境

### 1. 启动后端

```bash
cd /Users/liangxiaolong/Documents/测试项目/backend
npm install
npm run dev
```

后端默认运行在 `http://localhost:3001`。

### 2. 启动前端

```bash
cd /Users/liangxiaolong/Documents/测试项目/frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。

开发环境建议先复制环境变量模板：

```bash
cp /Users/liangxiaolong/Documents/测试项目/frontend/.env.example /Users/liangxiaolong/Documents/测试项目/frontend/.env
cp /Users/liangxiaolong/Documents/测试项目/backend/.env.example /Users/liangxiaolong/Documents/测试项目/backend/.env
```

如果你的本机 `3001` 端口被占用，可以把 [frontend/.env.example](/Users/liangxiaolong/Documents/测试项目/frontend/.env.example) 中的 `VITE_PROXY_TARGET` 改成实际后端地址。

### 生产部署

最简单的对外访问方式是使用 Docker Compose：

```bash
cd /Users/liangxiaolong/Documents/测试项目
docker compose up -d --build
```

启动后：

- 对外访问地址：`http://服务器IP:8080`
- 前端由 Nginx 提供静态资源
- `/api` 请求会自动反向代理到后端容器
- SQLite 数据保存在 `backend/data/employees.db`

停止服务：

```bash
cd /Users/liangxiaolong/Documents/测试项目
docker compose down
```

查看日志：

```bash
cd /Users/liangxiaolong/Documents/测试项目
docker compose logs -f
```

## 服务器发布建议

如果要让其他人通过公网访问，还需要：

1. 准备一台云服务器，比如阿里云、腾讯云、华为云或 AWS
2. 安装 Docker 和 Docker Compose
3. 放通服务器安全组端口 `8080`
4. 把本项目上传到服务器
5. 在服务器执行 `docker compose up -d --build`

如果你有域名，建议再加一层 Nginx 或云负载均衡，并配置 HTTPS。

## 当前能力

- 人员列表查询
- 按姓名/工号/部门搜索
- 新增人员
- 编辑人员
- 删除人员
- 在职/离职状态管理
- SQLite 本地持久化

## 接口示例

- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
