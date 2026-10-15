# 家庭学习室 · study-portal-v2

家庭学习门户：给 Kenton 和 Eddey 的每日学习入口、学科页、错题本、日程与接送表、家长页，以及 160 多个独立的互动学习小应用。

本仓库是从线上站点 <https://study-portal-eta.vercel.app/> 还原出来的：2026-10-15 在浏览器里逐个抓取已部署的文件，原样放回同样的目录结构。第一个提交就是线上版本的原貌，之后的提交是重新设计。

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

## 本地运行

纯静态站点，没有构建步骤：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

## 还原时没能拿回来的部分

- **后端 `/api/events`**：`assets/learning-sync.js` 会在生产环境把学习记录 POST 到 `/api/events`。这是 Vercel 上的服务端函数，网页端看不到源码，所以不在本仓库里。没有后端时，记录只保存在浏览器的 localStorage 队列中，页面其他功能正常。
- **线上本来就缺失的文件**：`data/apps.json` 里列着、但站点上返回 404 的页面，见 [`MISSING.md`](MISSING.md)。
- **`vercel.json`、`package.json` 等配置**：不会公开下发，无法还原。
