# 2026 年 7 月本地快照（只读参考）

这里是家长电脑上 `study-portal` 文件夹里、线上网站没有的那部分文件，2026-10-15 交接时收进来。那个文件夹对应旧的 GitHub 仓库 `easonyoung1990-dot/study-portal`，最后改动在 2026 年 7 月下旬。

**这里的内容不是当前状态。** 只用来查历史、找线索，不能拿来覆盖根目录的线上版本，也不能当成孩子今天的学情。

## 已经过时、不要照做的说法

- `CLAUDE.original.md`、`AGENTS.original.md`、`README.original.md` 里写的“公开仓库”“GitHub Pages 纯静态站”“没有后端、只靠手工导出”。现行规则（v3.2，2026-10-14）是：原生 HTML/CSS/JS 前端 + Vercel 接口 + 私有 Neon 学习库；正式代码基线是 `easonyoung1990-create/study-portal` 的 main。
- `cloud-api/` 是 7 月的 Cloudflare Worker 版同步后端。线上网站现在把学习记录发到 Vercel 的 `/api/events`，以正式仓库里的实现为准。
- `docs/学习记忆*.md`、`data/learning/` 里的画像和错题是 6–7 月的记录。现行规则下，学情以私有总档和 Neon 实际读回为准。

## 里面有什么

| 路径 | 内容 |
| --- | --- |
| `CLAUDE.original.md` `AGENTS.original.md` `README.original.md` `gitignore.original` | 7 月的仓库说明与协作规则原文 |
| `cloud-api/` `database/` | 7 月版同步后端与数据库迁移脚本（密钥走平台配置，文件里没有） |
| `tools/` | 生成默写软件、复习软件、冲刺卷、离线音频的脚本 |
| `docs/` | 产品蓝图、学习记忆、复习大纲、教材精读、外教课学情分析等 |
| `data/learning/` `data/tasks.json` `data/learning_records.json` | 6–7 月的学情画像、错题、默写记录与任务 |
| `papers/` | 期末冲刺卷与 C++ 学习总结 PDF |
| `apps/eddey_math_gold4_u1.html` `preply.html` `podcast/` | 线上已不再提供的旧页面 |

有用的东西要拿回正式位置时，先和正式仓库的当前版本比对，再按现行规则改写，不要整份搬回。
