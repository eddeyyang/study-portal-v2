# 家庭学习室 · study-portal-v2

家庭学习门户：给 Kenton 和 Eddey 的每日学习入口、学科页、错题本、日程与接送表、家长页，以及 160 多个独立的互动学习小应用。

本仓库由两部分合成（2026-10-15）：

- **线上站点** <https://study-portal-eta.vercel.app/>：在浏览器里逐个抓取已部署的文件，原样放回同样的目录结构。凡是线上有的文件，都以线上版本为准。
- **本地原始源码** `C:\Users\User\study-portal`（原仓库 `easonyoung1990-dot/study-portal`，7 月快照）：补进线上看不到的后端 `cloud-api/`、数据库 `database/`、工具脚本 `tools/`、文档 `docs/` 和学习数据 `data/learning/`。`local-data/` 按原项目规则不入库。

本仓库为**私有仓库**，含孩子的学习档案。

## 目录

| 路径 | 内容 |
| --- | --- |
| `index.html` | 首页（内容由 `assets/portal.js` 渲染） |
| `today.html` `subject.html` `apps.html` | 今日任务、学科页、全部学习内容（同一套渲染脚本，按页面类型切换） |
| `parent.html` | 家长页：学习记录、测试开关 |
| `school_day.html` | 日程与接送表 |
| `mistakes.html` | 错题本 |
| `summer.html` `summer_day.html` `exam-prep.html` | 暑假计划、暑假每日页、备考页 |
| `paper-intake.html` `paper-lesson.html` | 试卷录入（含浏览器端 OCR，`assets/paper-ocr/`）和试卷讲解 |
| `knowledge-map.html` | 知识地图 |
| `apps/` | 每一节互动课都是一个独立的 HTML 文件，音频和插图在 `apps/audio/`、`apps/media/`、`apps/assets/` |
| `papers/` | 试卷页 |
| `data/` | 目录数据：`apps.json`（学习内容清单）、`portal-navigation.json`（导航与学期配置）等 |
| `assets/` | 共享脚本与样式 |
| `materials/` | 课程 PDF |
| `cloud-api/` | 学习记录同步后端（Cloudflare Worker），密钥 `DATABASE_URL`、`SYNC_KEY` 走平台密钥配置，不在代码里 |
| `database/` | 数据库迁移脚本 |
| `tools/` | 生成默写、复习软件和试卷的脚本 |
| `docs/` | 产品蓝图、学习记忆、复习大纲等文档 |
| `data/learning/` | 学习画像、错题与默写记录 |

## 本地运行

纯静态站点，没有构建步骤：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

## 还原时没能拿回来的部分

- **线上的 `/api/events`**：`assets/learning-sync.js` 在生产环境把学习记录 POST 到 `/api/events`。`cloud-api/` 是 7 月版本的后端，线上 Vercel 版本可能已有更新。
- **线上本来就缺失的文件**：`data/apps.json` 里列着、但站点上返回 404 的页面，见 [`MISSING.md`](MISSING.md)。
- **`vercel.json`、`package.json` 等配置**：不会公开下发，无法还原。
