# study-portal 数据库

这里保存 Neon 数据库的**结构蓝图**，不保存数据库密码，也不保存孩子的真实学习记录。

## 分工

- GitHub：网页、学习软件、数据库结构和修改历史。
- Neon：作答记录、错题、进度、时间与统计等结构化运行数据。
- 文件存储：PDF、图片、音频等大文件继续放静态站，后续规模变大时迁移到 R2；Neon 只记录文件标题、类型、网址和归属等元数据。

## 当前结构

`migrations/001_learning_events.sql` 创建 `learning_events`，用于保存：

- 孩子：仅 `kenton` / `eddey`；`system` 只用于无隐私的连接测试。
- 学科、活动、知识点、题目摘要、正误、提示。
- 客户端事件 ID、发生时间、来源和扩展 JSON。

## 安全规则

1. Neon 连接串只配置为部署平台的 Secret，绝不写进 HTML、JavaScript、JSON、文档或 Git 提交。
2. 公开仓库只使用 Kenton / Eddey，不记录姓氏、学校、班级、住址、照片或账号信息。
3. 儿童页面不得静默上传；第一阶段只允许家长页面明确点击后同步。
4. 数据库不是文件网盘，不把 PDF、MP3、照片本体写入表中。

## API 中转

`cloud-api/` 是独立的 Cloudflare Worker。公开网页只调用它；只有 Worker 能读取 Neon 连接串。家长页面需明确点击并提供本机保存的同步密钥后，Worker 才接受写入。
