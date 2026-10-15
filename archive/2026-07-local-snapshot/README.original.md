# 家庭学习门户 · study-portal

把散落的学习资产收拢成一个"自家学习 App"——全家任何设备打开网址就能用。

- **孩子端**：打开网址看今日任务、玩学习软件、看自己的星星。
- **爸爸端（学习工厂）**：用 Claude Code 生成/更新内容 → `git push` → 网站约 1 分钟内自动更新。
- **静态只读架构**：孩子端永远只是打开看，所有数据更新都在爸爸电脑端发生。

## 目录结构

| 路径 | 说明 |
|------|------|
| `index.html` | 首页：选择 Kenton / Eddey |
| `today.html` | 今日任务 + 播报入口 |
| `apps.html` | 软件库（读取 `data/apps.json`） |
| `stars.html` | 星星榜（读取 `data/scores.json`） |
| `parent.html` | 家长页：卷子下载 + 匿名化趋势 |
| `data/` | 任务 / 软件清单 / 积分 / 播报索引（JSON） |
| `apps/` `papers/` `podcast/` | 学习软件 / 卷子 PDF / 播报页 |
| `local-data/` | 🔒 本地敏感数据（错题原文等），**已 gitignore，永不上传** |
| `docs/产品蓝图.md` | 总施工图 |

## 隐私红线

- 网站只用英文小名 Kenton / Eddey，绝不出现姓氏、学校、班级、照片。
- 错题原文、批改细节只留本地 `local-data/`。
- 仓库内永不提交任何账号密码或密钥。

## 更新方式

爸爸端对 Claude Code 说一句"更新门户"，即可改 JSON 并推送，网站自动更新。
