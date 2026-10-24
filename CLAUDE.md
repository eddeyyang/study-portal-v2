# CLAUDE.md · study-portal-v2

开工前读这一页。它只说明这个仓库是什么、东西放在哪；项目规则不在这里另写一份。

## 这个仓库是什么

- Kenton 与 Eddey 的家庭学习门户的 Claude 工作仓库，放在 Claude 专用的 GitHub 账号 `eddeyyang` 下，**公开**（家长 2026-10-22 改为公开），并开了 GitHub Pages 预览站 https://eddeyyang.github.io/study-portal-v2/ 。推到 `main` 的内容会公开可见，提交前确认不含私密件。根目录的 `.nojekyll` 让下划线开头的文件（如音频 `_manifest.json`）也能发布，不要删。
- 2026-10-15 由两部分合成：线上网站 study-portal-eta.vercel.app 的完整抓取（根目录），加上家长电脑里 7 月本地快照中线上没有的部分（`archive/2026-07-local-snapshot/`）。
- **内容镜像（家长 2026-10-22 定）**：正式站由 GPT 维护；v2 的学习内容和更新每天自动跟正式站同步（定时任务「Study Portal 内容同步」，工具和说明在 `tools/upstream-sync/`），只搬内容、不动 v2 自己的设计。教法和设计上的改动只在家长单独交办时做；同步是单向的，v2 不往正式站推。在 v2 里改一个从正式站来的文件之前，先运行 `python3 -I tools/upstream-sync/sync.py --mark-custom <路径>` 登记基线，之后上游的内容改动会合并进来而不是覆盖。
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
| `apps/drone/` | 无人机二级航线，Claude 重做（家长 2026-10-23 交办），v2 自有、同步工具不碰。门户里的二级入口由 `assets/v2-course-routes.js` 指过来（`assets/portal.js` 里一行接入）。学习记录只存浏览器，按孩子和正式/测试分开的键保存。科目一、科目二的绕法按官方示意图理解，待教练确认 |
| `apps/v2/dictation/` | 听写台，Claude 重做（家长 2026-10-24 交办，替代正式站的《期中听写桌》）。流程：选课 → 先看一遍 → 立刻计时逐词报读（屏幕不显示词） → 对答案点错 → 错词再默。词库仍读同步来的 `data/midterm-dictation-20261024.json`；录音在 `apps/audio/v2-dictation/`（`tools/dictation-audio/make_audio.py` 用微软神经网络语音逐词生成，文件名 FNV-1a(`zh|词` / `en|word`)，`_manifest.json` 有时长；只做了机器检查，未人耳逐条试听）。没有录音的词明示家长口报，不用浏览器语音兜底。记录键 `sp2.dictation:<who>:<subject>:<formal|test>` |
| `apps/v2/math-mistakes/` | 两孩数学错题本，Claude 重做（2026-10-24，替代正式站的两个 `*_math_mistakes_20261024.html`）。每天 10 题，先独立做 → 错一次给关键关系 → 再错看步骤后回原题 → 不同两天独立做对才过关。题库读同步来的 `data/learning/<who>_math_mistakes_20261024.json`。记录键 `sp2.math-mistakes:<who>:<formal|test>` |
| `assets/v2-course-routes.js` | v2 自有：把门户目录里的入口改指向上面这些 Claude 重做的应用（无人机二级、听写、数学错题本）。`mistakes.html` 里的错题本链接也改指 v2（已 `--mark-custom`） |
| `archive/2026-07-local-snapshot/` | 7 月本地快照，只读参考，不是当前学情 |
| `MISSING.md` | 线上本来就缺、仓库也没有的页面和音频 |
| `tools/upstream-sync/` | 正式站 → v2 的内容同步工具、同步状态和每日记录（`log/`）；`conflicts/` 里有东西就是有待人处理的合并冲突 |

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
