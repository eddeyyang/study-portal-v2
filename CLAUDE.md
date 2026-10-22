# CLAUDE.md · study-portal-v2

开工前读这一页。它只说明这个仓库是什么、东西放在哪；项目规则不在这里另写一份。

## 这个仓库是什么

- Kenton 与 Eddey 的家庭学习门户的 Claude 工作仓库，放在 Claude 专用的 GitHub 账号 `eddeyyang` 下，**私有**。
- 2026-10-15 由两部分合成：线上网站 study-portal-eta.vercel.app 的完整抓取（根目录），加上家长电脑里 7 月本地快照中线上没有的部分（`archive/2026-07-local-snapshot/`）。
- **Claude 的提交一律推到这里**（`eddeyyang/study-portal-v2`，家长 2026-10-22 指定）。原仓库 `easonyoung1990-create/study-portal` 不给 Claude 写权限，也不向它推送。
- 线上网站目前仍由原仓库部署。v2 的改动要不要上线、怎么接 Vercel 和 Neon，由家长另行决定；决定之前不部署、不覆盖线上。
- 原仓库的现行 `AGENTS.md`、`DESIGN.md` 等 Claude 目前读不到，需要家长另行提供只读副本（见缺口条例 A3）。

## 规则在哪里

按这个顺序读，不在仓库里复制规则：

1. 家长在当前对话里的最新要求。
2. Claude 项目「Git connection」的项目说明，以及项目文档 `Study-Portal-Claude-Setup.md`（主规则 v3.2）。
3. 项目文档《Study Portal 交接整理与缺口条例》：现在缺什么、哪些待家长决定。
4. 正式仓库的 `AGENTS.md`、`DESIGN.md`、`docs/学习软件标杆与交互图谱.md`（拿到正式仓库后读当前版本）。

`archive/` 里的 `CLAUDE.original.md`、`AGENTS.original.md` 写的是 7 月的“公开仓库、GitHub Pages、无后端”，已经过时，只能查历史。

## 目录约定

| 位置 | 说明 |
| --- | --- |
| 根目录、`apps/`、`assets/`、`data/`、`papers/`、`materials/` | 线上 2026-10-15 版本，以它为准 |
| `assets/portal-theme.css` | “书桌”新外观（2026-10-22），只改首页、今日、学科、全部内容四页的外观；首页日历页和田字格学科名在 `assets/portal.js` 里；未经家长手机和电脑实看验收 |
| `assets/shell-theme.css` | 同一套“书桌”外观用于日程与接送表、家长页、错题本、暑假、备考、试卷录入/讲解；每页 `</head>` 前最后一个样式表，只改外观；单个学习小应用（`apps/`）不改 |
| `apps/audio/` | 朗读音频。文件名是对 `语言|文字` 做 FNV-1a 得到的 8 位十六进制，与页面里的 `audioHash()` 一致 |
| `archive/2026-07-local-snapshot/` | 7 月本地快照，只读参考，不是当前学情 |
| `MISSING.md` | 线上本来就缺、仓库也没有的页面和音频 |

## 必须守住

- 哥哥 Kenton（青蓝）和弟弟 Eddey（珊瑚橙）的内容、记录、存储键分开，不混用。
- 不提交密码、令牌、数据库连接串、`.env`、`local-data/`、带原卷照片或批改痕迹的私密件。
- 提交、推送、合并、部署、数据库写入都要有家长对具体对象和动作的授权；完成后分别读回、分别报告。
- 改页面后在手机竖屏和桌面都实际打开、走一遍主操作；视觉、功能、声音、数据分开验收。

## 本地预览

```bash
python3 -m http.server 8000   # 打开 http://localhost:8000/
```

线上的学习记录同步要走 Vercel 的 `/api/events`，本地预览时页面会自动只存在浏览器里，其他功能正常。
