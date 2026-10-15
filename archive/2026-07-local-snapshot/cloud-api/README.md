# study-portal Cloud API

Cloudflare Worker 为公开的 GitHub Pages 与私有 Neon 数据库提供安全中转。

## 数据流

`家长页明确点击 → Cloudflare Worker → Neon learning_events`

儿童页面不会因为这个 Worker 上线就自动上传。家长页必须在当前浏览器配置同步密钥，写入请求才会被接受。

## Secret

部署环境必须配置：

- `DATABASE_URL`：Neon 连接串。
- `SYNC_KEY`：家长页写入与读取使用的随机密钥。

两个值都不得写入仓库。开发机私密值放 `.dev.vars` 或 `local-data/`。

## 接口

- `GET /health`：无隐私的数据库连通检查。
- `POST /events`：写入 1–200 条结构化学习事件，需要 `X-Sync-Key`。
- `GET /events?mode=stats`：按孩子、学科、知识点汇总，需要 `X-Sync-Key`。
- `GET /events?mode=errors&kid=kenton|eddey`：读取最近错题，需要 `X-Sync-Key`。

跨域只允许正式 GitHub Pages 来源与本地 8000 端口测试环境。
