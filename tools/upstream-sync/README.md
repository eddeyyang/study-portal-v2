# 上游内容同步（正式站 → v2）

家长 2026-10-22 定的做法：v2 是 Claude 的工作版，学习内容和更新要跟 GPT 维护的正式站
（https://study-portal-eta.vercel.app/ ，由原仓库 `easonyoung1990-create/study-portal` 的 `main` 部署）保持同步；
v2 保留 Claude 自己的设计，设计和教法上的改动只在家长单独交办时做。
同步是单向的：正式站 → v2。v2 不往正式站推任何东西。

## 每天怎么跑

定时任务「Study Portal 内容同步」每天跑一次，在一个新会话里：接入仓库 → 完整克隆 → 运行本工具 → 处理冲突 → 验证 → 提交推送 → 核对预览站 → 简短汇报。
在 Child Study 项目的对话里说“同步一下正式站”也能随时手动跑。

```bash
python3 -I tools/upstream-sync/sync.py            # 同步；在 log/ 留当天记录，last-report.json 是最近一次
python3 -I tools/upstream-sync/sync.py --verify   # JSON 能解析、音频清单里的文件都在、页面引用的本地文件存在
python3 -I tools/upstream-sync/sync.py --check-site   # 预览站 https://eddeyyang.github.io/study-portal-v2/ 已拿到最近一次同步的文件
```

## 同步时怎么分内容和设计

| 情况 | 做法 |
| --- | --- |
| v2 没改过的文件（绝大多数小应用、数据、音频、图片） | 直接换成上游新版本 |
| v2 改过样式的文件（`base/` 里有它的上游旧版） | 三方合并：保留 v2 的设计行，接收上游的内容改动 |
| 合并冲突 | v2 文件不动；上游新版放 `conflicts/<路径>`，上游旧版放 `conflicts/<路径>.base`；人（或当班的 Claude）把内容合进去后运行 `--resolve <路径>` |
| 上游新增的文件 | 加进来：顺着变化的页面和 `data/apps.json` 找新页面、数据、图片、音频清单；按哈希命名的朗读音频按页面文字逐条算哈希去取 |
| 上游删掉的文件 | 只在报告里列出，不删 |
| v2 独有的文件 | 不同步：`README.md` `MISSING.md` `CLAUDE.md` `.gitignore` `.nojekyll` `assets/portal-theme.css` `assets/shell-theme.css` `archive/` `tools/` |

在 v2 里改任何一个从上游来的文件之前，先运行 `--mark-custom <路径>` 登记它的上游基线；忘了也没关系，下次同步会从 git 历史自动补（所以定时任务要完整克隆，不能浅克隆）。

## 文件

- `state.json`：每个已同步文件的上游版本指纹和 ETag。每天只下载变了的文件。
- `base/`：v2 改过的文件的上游旧版，三方合并用。
- `conflicts/`：待人处理的冲突副本。平时应为空。
- `log/<日期>.json`、`last-report.json`：每次同步改了什么。

## 报告里要盯的几项

- `conflicts`：当天必须处理或明确留给家长。
- `removed_upstream`：上游删了的页面，由家长决定 v2 是否跟着下架。
- `hash_apps_without_audio`：用哈希音频的新页面一条音频都没找到，可能是上游本来就没录（对照 `MISSING.md`）。
- `customized_without_base`：v2 改过但找不到上游基线的文件，下次上游改它就会冲突。
- `errors`：网络或上限问题，原条件下最多重跑两次。
