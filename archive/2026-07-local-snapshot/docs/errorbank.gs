/**
 * 小小错题库 · 云端后端 (Google Apps Script Web App)
 * 数据存在与本脚本绑定的那个【私有 Google 表格】里，只有你的 Google 账号能看。
 *
 * 部署步骤（约 5 分钟，全在你自己的 Google 账号里）：
 *   1. 打开 https://sheets.new 新建一个空表格，命名比如 "errorbank"（这就是私有数据库）。
 *   2. 菜单：扩展程序 → Apps Script，把本文件全部内容粘进去，保存。
 *   3. 右上角"部署" → "新建部署" → 类型选"网络应用"：
 *        - 说明：errorbank
 *        - 执行身份：我（你自己）
 *        - 谁可以访问：任何人
 *      点"部署"，按提示授权（会弹你自己的 Google 授权，正常点同意）。
 *   4. 复制最后给出的"网络应用 URL"（形如 https://script.google.com/macros/s/AKfy.../exec），
 *      把这个 URL 发给 Claude。Claude 不需要、也不会要你的 Google 密码。
 *
 * 之后 Claude 会把孩子的 App 和家长页接到这个 URL：错题自动汇总、任意设备可看。
 */

var SHEET_NAME = 'errors';

function _sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['ts', 'kid', 'subject', 'topic', 'item', 'ok', 'hint']);
  }
  return sh;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 写入：孩子的 App 用 text/plain POST 一条或一批错题（避免浏览器 CORS 预检）
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var rows = Array.isArray(data) ? data : [data];
    var sh = _sheet();
    rows.forEach(function (r) {
      sh.appendRow([
        r.ts || new Date().toISOString(),
        String(r.kid || ''),
        String(r.subject || ''),
        String(r.topic || ''),
        String(r.item || ''),
        r.ok ? 1 : 0,
        String(r.hint || '')
      ]);
    });
    return _json({ ok: true, added: rows.length });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// 读取：家长页 doGet
//   ?mode=stats            -> 按 孩子+学科+知识点 汇总正确率（画趋势用）
//   ?mode=errors&kid=...   -> 返回错题明细（出"错题重做卷"用）
function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) || 'stats';
  var sh = _sheet();
  var vals = sh.getDataRange().getValues();
  if (vals.length <= 1) return _json({ ok: true, stats: [], errors: [] });
  vals.shift(); // 去表头
  var rows = vals.map(function (v) {
    return { ts: v[0], kid: v[1], subject: v[2], topic: v[3], item: v[4], ok: v[5], hint: v[6] };
  });

  if (mode === 'errors') {
    var kid = e.parameter.kid;
    var out = rows.filter(function (r) { return Number(r.ok) === 0 && (!kid || r.kid === kid); });
    return _json({ ok: true, errors: out });
  }

  var agg = {};
  rows.forEach(function (r) {
    var key = r.kid + '|' + r.subject + '|' + r.topic;
    if (!agg[key]) agg[key] = { kid: r.kid, subject: r.subject, topic: r.topic, attempts: 0, correct: 0 };
    agg[key].attempts++;
    if (Number(r.ok) === 1) agg[key].correct++;
  });
  return _json({ ok: true, stats: Object.keys(agg).map(function (k) { return agg[k]; }) });
}
