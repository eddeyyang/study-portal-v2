# 家庭学习室 · study-portal-v2

Kenton 和 Eddey 的家庭学习门户：每日学习入口、学科页、错题本、日程与接送表、家长页，以及 160 多个独立的互动学习小应用。

这是 Claude 的工作仓库（GitHub 账号 `eddeyyang`，私有），Claude 的提交都推到这里（家长 2026-10-22 指定）。线上网站目前仍由原仓库 `easonyoung1990-create/study-portal` 部署；上线方式和其他待决定事项见 Claude 项目文档《Study Portal 交接整理与缺口条例》。

## 内容从哪里来（2026-10-15）

| 来源 | 放在哪里 | 怎么用 |
| --- | --- | --- |
| 线上网站 study-portal-eta.vercel.app，逐个文件抓取，含 1,900 多个朗读音频 | 根目录 | 当前版本，以它为准 |
| “书桌”视觉改版（2026-10-22） | `assets/portal-theme.css`（门户四页）、`assets/shell-theme.css`（日程、家长页、错题本等工具页） | 候选，待家长实看验收 |
| 家长电脑里 7 月的本地源码（旧仓库 `easonyoung1990-dot/study-portal`）中线上没有的部分 | `archive/2026-07-local-snapshot/` | 只读参考，不是当前状态 |

## 目录

| 路径 | 内容 |
| --- | --- |
| `index.html` | 首页（内容由 `assets/portal.js` 渲染） |
| `today.html` `subject.html` `apps.html` | 今日、学科页、全部学习内容（同一套渲染脚本） |
| `parent.html` | 家长页 |
| `school_day.html` | 日程与接送表 |
| `mistakes.html` | 错题本 |
| `summer.html` `summer_day.html` `exam-prep.html` | 暑假计划、暑假每日页、备考页 |
| `paper-intake.html` `paper-lesson.html` | 试卷录入（浏览器端识字，`assets/paper-ocr/`）和试卷讲解 |
| `knowledge-map.html` | 知识地图 |
| `apps/` | 互动学习小应用，一节一个 HTML；音频、插图在 `apps/audio/` `apps/media/` `apps/assets/` |
| `papers/` | 试卷页 |
| `data/` | 目录与配置：`apps.json`（学习内容清单）、`portal-navigation.json`（导航、学期、下架清单）等 |
| `assets/` | 共享脚本与样式 |
| `materials/` | 课程 PDF |
| `archive/` | 历史快照，见其中的 README |

## 本地预览

纯静态站点，没有构建步骤：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

学习记录同步走线上 Vercel 的 `/api/events`；本地预览时记录只留在浏览器里，其他功能正常。

## 缺的东西

- 线上本来就缺、仓库也没有的页面和音频：[`MISSING.md`](MISSING.md)。
- 正式仓库、Vercel 接口源码、Neon 学习库、私有学习总档等交接缺口：见 Claude 项目文档《Study Portal 交接整理与缺口条例》。
