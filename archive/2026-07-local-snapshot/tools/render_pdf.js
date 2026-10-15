// 把 HTML 报告渲染成 A4 PDF（可复现）。
// 用法：NODE_PATH=/opt/node22/lib/node_modules node tools/render_pdf.js <输入.html> <输出.pdf>
const { chromium } = require('playwright');
(async () => {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) { console.error('用法: node render_pdf.js <input.html> <output.pdf>'); process.exit(1); }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + require('path').resolve(input), { waitUntil: 'networkidle' });
  await page.pdf({ path: output, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  await browser.close();
  console.log('已生成 PDF：' + output);
})();
