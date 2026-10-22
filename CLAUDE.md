# CLAUDE.md · study-portal-v2

开工前读这一页。它只说明这个仓库是什么、东西放在哪；项目规则不在这里另写一份。

## 这个仓库是什么

- Kenton 与 Eddey 的家庭学习门户的 Claude 工作仓库，放在 Claude 专用的 GitHub 账号 `eddeyyang` 下，**公开**（家长 2026-10-22 改为公开），并开了 GitHub Pages 预览站 https://eddeyyang.github.io/study-portal-v2/ 。推到 `main` 的内容会公开可见，提交前确认不含私密件。根目录的 `.nojekyll` 让下划线开头的文件（如音频 `_manifest.json`）也能发布，不要删。
- 2026-10-15 由两部分合成：线上网站 study-portal-eta.vercel.app 的完整抓取（根目录），加上家长电脑里 7 月本地快照中线上没有的部分（`archive/2026-07-local-snapshot/`）。
- **Claude 的提交一律推到这里**（`eddeyyang/study-portal-v2`，家长 2026-10-22 指定）。原仓库 `easonyoung1990-create/study-portal` 不给 Claude 写权限，也不向它推送。
- 线上网站目前仍由原仓库部署。v2 的改动要不要上线、怎么接 Vercel 和 Neon，由家长另行决定；决定之前不部署、不覆盖线上。
- 原仓库的现行 `AGENTS.md`、`DESIGN.md` 等 Claude 目前读不到，需要家长另行提供只读副本（见缺口条例 A3）。`eddeyyang/study-portal` 里另有一份可只读参考，是否与原仓库同步未核。

## 规则在哪里

按这个顺序读，不在仓库里复制规则：

1. 家长在当前对话里的最新要求。
2. Claude 项目「Child Study」（Study Portal 学习项目）的项目说明，以及项目文档 `Study-Portal-Claude-Setup.md`（主规则 v3.2）。2026-10-22 起，v2 的日常改动和推送都在「Child Study」项目里做（家长指定）。
3. 项目文档《Study Portal 交接整理与缺口条例》：现在缺什么、哪些待家长决定。它原随 Claude 项目「Git connection」整理，「Child Study」项目资料里目前没有这份；需要时请家长上传副本，读不到就说明未核，不凭记忆补写。
4. 正式仓库的 `AGENTS.md`、`DESIGN.md`、`docs/学习软件标杆与交互图谱.md`（拿到正式仓库后读当前版本）。

`archive/` 里的 `CLAUDE.original.md`、`AGENTS.original.md` 写的是 7 月的“公开仓库、GitHub Pages、无后端”，已经过时，只能查历史。

## 目录约定

| 位置 | 说明 |
| --- | --- |
| 根目录、`apps/`、`assets/`、`data/`、`papers/`、`materials/` | 线上 2026-10-15 版本，以它为准 |
| 外观 | 家长 2026-10-22 决定：审美和配色以线上原版为准，先不改网站大框架。首页用家长选定的“今日天空”（`assets/portal-theme.css` 加 `assets/portal.js` 的首页部分，天空随真实时间变化）；今日、学科、全部内容三页套用同一份样式；日程、家长页、错题本等工具页是线上原版。Claude 做过的“作业本”“书桌”两版已撤回，只留在 Git 历史里 |
| `apps/audio/` | 朗读音频。文件名是对 `语言|文字` 做 FNV-1a 得到的 8 位十六进制，与页面里的 `audioHash()` 一致 |
| `archive/2026-07-local-snapshot/` | 7 月本地快照，只读参考，不是当前学情 |
| `MISSING.md` | 线上本来就缺、仓库也没有的页面和音频 |

## 必须守住

- 哥哥 Kenton（青蓝）和弟弟 Eddey（珊瑚橙）的内容、记录、存储键分开，不混用。
- 不提交密码、令牌、数据库连接串、`.env`、`local-data/`、带原卷照片或批改痕迹的私密件。
- 提交、推送、合并、部署、数据库写入都要有家长对具体对象和动作的授权；完成后分别读回、分别报告。
- 已有的具体授权（家长 2026-10-22）：在「Child Study」项目里为家长交办的任务改动本仓库后，验证通过即由 Claude 提交并推送到本仓库 `main`，不再逐次询问。推送前先 `git fetch` 对齐、不覆盖别处的新提交；推送后读回远端提交号再报告。这份授权只到本仓库：不推原仓库、不部署、不改 Vercel/Neon、不改写或删除历史；同一项改动只推一次，不并行推送。
- 改页面后在手机竖屏和桌面都实际打开、走一遍主操作；视觉、功能、声音、数据分开验收。

## 本地预览

```bash
python3 -m http.server 8000   # 打开 http://localhost:8000/
```

线上的学习记录同步要走 Vercel 的 `/api/events`，本地预览时页面会自动只存在浏览器里，其他功能正常。
