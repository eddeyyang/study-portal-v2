# 线上缺失的文件

以下文件被 `data/apps.json`、`data/portal-navigation.json` 或页面引用，但在 2026-10-15 抓取时线上返回 404，所以本仓库里没有。门户的导航逻辑本来就会过滤其中的 `news_*.html`。

**每日新闻（22 个）**：`apps/news_20260623.html` 至 `apps/news_20260722.html`

**编程课**
- `apps/hetao_coding_l2-3_l2-4.html`
- `apps/hetao_coding_l2-4_l3-1.html`
- `apps/hetao_coding_l3-1_l3-2.html`

**其他**
- `mistake_analysis.html`（`mistakes.html` 里有链接）
- `assets/paper-ocr/assets/worker-entry-C9UNuyOJ.js`（OCR 打包里提到的 worker 文件）
