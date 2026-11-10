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
| `apps/drone/` | 无人机二级航线，Claude 重做（家长 2026-10-23 交办），v2 自有、同步工具不碰。门户里的二级入口由 `assets/v2-course-routes.js` 指过来（`assets/portal.js` 里一行接入）。学习记录存在浏览器（按孩子和正式/测试分开的键），2026-11-01 起飞完一站、秒答、复习、机考交卷或离开页面时经 `assets/v2-records.js` 上报（app: drone）。科目一、科目二的绕法按官方示意图理解，待教练确认 |
| `apps/v2/dictation/` | 听写台，Claude 重做（家长 2026-10-24 交办，替代正式站的《期中听写桌》）。流程：选课 → 先看一遍 → 立刻计时逐词报读（屏幕不显示词） → 对答案点错 → 错词再默。词库仍读同步来的 `data/midterm-dictation-20261024.json`；录音在 `apps/audio/v2-dictation/`（`tools/dictation-audio/make_audio.py` 用微软神经网络语音逐词生成，文件名 FNV-1a(`zh|词` / `en|word`)，`_manifest.json` 有时长；只做了机器检查，未人耳逐条试听）。没有录音的词明示家长口报，不用浏览器语音兜底。记录键 `sp2.dictation:<who>:<subject>:<formal|test>` |
| `apps/v2/math-mistakes/` | 两孩数学错题本，Claude 重做（2026-10-24，替代正式站的两个 `*_math_mistakes_20261024.html`）。每天 10 题，先独立做 → 错一次给关键关系 → 再错看步骤后回原题 → 不同两天独立做对才过关。题库读同步来的 `data/learning/<who>_math_mistakes_20261024.json`。记录键 `sp2.math-mistakes:<who>:<formal|test>` |
| `apps/v2/exam-map/` | 考前脑图，Claude 重做（家长 2026-11-01 交办，替代正式站《知识连起来 · 周末复习册》的知识地图部分；"读写背"节仍用正式站原页）。一屏一张 SVG 脑图：中心本科 → 单元（带主线）→ 关键关系节点；★ 知识重点、红圈"错 N"错题重点（数学按 `data/learning/<who>_math_mistakes_20261024.json` 逐题归到节点，弟弟语文按订正记录）。点节点看关键关系与关系链，再做 5 题（知识题 + 错题本原题）；「快速过一遍」10 题。知识节点读同步来的 `assets/review-atlas/content.js`、`memory.js`；必考必会补充节点在 `essentials.js`（数学、语文手写；英语语法点由 `tools/exam-map/extract_english.py` 从同步来的语法页抽成 `data/english-grammar.json`，上游改了就重跑）；v2 自己加的映射、关系链、错因、考试范围（`examScope`）、提醒都在 `overlay.js`。期中手册（沪学习 5上《期中复习知识手册》英数语＋《知识梳理》，家长 2026-11-01 交来）提炼的内容在 `data/midterm-handbook.json`，目前只有哥哥：`merge` 并进已有卡的例子、易错、题；`nodes` 新补的卡（标 ★）；`branches` 里 `optional` 的是"学到再看"分支（不排进按顺序学和快速过一遍）。数学"多边形的面积"：家长 2026-11-01 确认期中不考，用 `overlay.js` 的 `examScope`（哥哥数学到第 3 单元）收起，数据留着备期末；`words` 是单词/词语的补充、易错提醒和陷阱题。知识点重写、题目原创，不含手册原题、原文、图片（仓库公开）。知识题的选择项显示时打乱顺序（错题本原题不动）。孩子写对却被判错的题，在 `tools/exam-map/extract_english.py` 的 `EXTRA_ALIASES` 里补其他对的写法后重跑。记录键 `sp2.exam-map:<who>:<subject>:<formal|test>`，做完一轮经 `assets/v2-records.js` 上报（app: exam-map） |
| `apps/v2/badge-story/` | 《两枚徽章诞生记》，Claude 做的 v2 自有小项目（家长 2026-11-04 交办，正式站没有）：两孩电子徽章的想法、零件、锡焊、9 道工序、哪里失败（“断一处灭一片”小实验）、电路板贴片的新做法、为什么插上 USB 能写程序（改 STEP 的小实验）、以后的方向和比赛时跟专家讲的四句话；8 站约 15 分钟，两孩共用内容、进度分开。素材在 `media/`：装配动画片段（720p，有配音）、设计效果图、海报、接线图；完整装配动画的片头标签改成“两枚徽章诞生记 · 选看”（片段从两孩的装配教学动画里剪出，生成脚本不在本仓库）。门户入口由 `assets/v2-course-routes.js` 的 `V2_EXTRA` 加进“探索与实践”。记录键 `sp2.badge-story:<who>:<formal|test>`，学完一站、学完全部或离开页面时经 `assets/v2-records.js` 上报（app: badge-story） |
| `apps/v2/big-numbers/` | 《大数王国》，弟弟四上第 4 单元《大数的认识与改写》预习，Claude 做（家长 2026-11-10 交办：期中后下一单元，要教透、互动生动）。8 站：满十进一工厂 → 数位顺序表（数字旅行、动手分级） → 读数机（每个 0 标“不读/读零”） → 写数（键盘边写边自动分级） → 比大小 → 改写（=） → 近似数（数轴拖点看离哪个整万数近，≈）→ 12 道每次随机生成的新题闯关。读法算法在 `core.js`（与独立实现对拍 20 万个随机数一致）。错一次给关键关系再试，再错看步骤，可“再做一次”。门户里原 `eddey_math_gold_g4u4.html` 入口由 `assets/v2-course-routes.js` 改指过来（金牌预习馆 `math_gold_hub` 里的旧链接没改）。记录键 `sp2.big-numbers:<who>:<formal|test>`，做完一站、闯关交卷或离开页面时经 `assets/v2-records.js` 上报（app: big-numbers）。教材具体页码未核，按课本目录“大数的认识”“大数的改写”两节做 |
| `assets/v2-course-routes.js` | v2 自有：把门户目录里的入口改指向上面这些 Claude 重做的应用（无人机二级、听写、数学错题本、考前脑图、弟弟第 4 单元大数王国）；另把 v2 自有、目录里没有的《两枚徽章诞生记》用 `V2_EXTRA` 加进目录。`mistakes.html` 里的错题本链接也改指 v2（已 `--mark-custom`） |
| `assets/v2-records.js`、`assets/v2-page-sync.js` | 学习记录上报（家长 2026-11-01：V2 上所有学习页面都要把记录发给家长）。V2 自己的软件直接调 `V2Records.enqueue`；同步来的正式站页面由 `sync.py` 在每页自动加一行引用这两个脚本（`data-v2-sync`），`v2-page-sync.js` 旁听页面存的进度，离开页面或点“完成并发给家长”时发出（app: page，带页面、认出的对错行和改动过的进度），并把 learning-sync 顶部紫条改成 V2 的说明。只在 eddeyyang.github.io 上记正式；`?test=1`、家长测试和本地预览记 test。接收站在家长服务器（`tools/records-receiver/`），每小时推到私有仓库 `eddeyyang/study-records`，定时任务「Study Portal 学情读取」每天写进两份学情总档。以后新做的 V2 软件也要上报，app 名只用小写字母、数字和连字符 |
| `archive/2026-07-local-snapshot/` | 7 月本地快照，只读参考，不是当前学情 |
| `MISSING.md` | 线上本来就缺、仓库也没有的页面和音频 |
| `tools/upstream-sync/` | 正式站 → v2 的内容同步工具、同步状态和每日记录（`log/`）；`conflicts/` 里有东西就是有待人处理的合并冲突。写入同步来的页面时自动加上学习记录转发那一行，判断“v2 改没改过”时不算这一行 |

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
