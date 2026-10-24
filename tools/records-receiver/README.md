# v2 学习记录接收站

孩子在 v2 的软件（听写台、数学错题本）里做完一轮，页面把结果发到这里；Claude 定时读取，写进 Child Study 项目的学情总档。
家长 2026-10-24 定：接收站放在家长自己的腾讯云服务器上。

## 组成

- `receiver.py`：接收程序，Python 3 标准库，无依赖。数据按天一个文件：`data/formal/2026-10-24.jsonl`（正式）、`data/test/…`（家长测试）。
- 页面端：`assets/v2-records.js`；地址在 `data/v2-records-config.json` 的 `endpoint`。为空时不发送，记录只留在孩子设备；填上后自动发送并补发之前排队的记录。
- 读取：`GET /records?since=YYYY-MM-DD&token=口令`，返回 JSON 数组。口令只给 Claude 读用，不写进仓库。

## 服务器上要做的（一次）

1. 把 `receiver.py` 放到服务器，例如 `/opt/v2-records/receiver.py`。
2. 生成一个读取口令（随机长串），以 systemd 服务常驻：
   ```
   Environment=RECORDS_DIR=/opt/v2-records/data
   Environment=READ_TOKEN=<口令>
   Environment=PORT=8788
   ExecStart=/usr/bin/python3 /opt/v2-records/receiver.py
   ```
3. 外层用已有的 HTTPS（Nginx/Caddy + 域名证书）把 `https://<域名>/v2-records/` 反代到 `127.0.0.1:8788/`。
   页面在 GitHub Pages（https）上，只能发往 https 地址；没有域名和证书就发不出去。
4. 把 `https://<域名>/v2-records/record` 填进 `data/v2-records-config.json` 的 `endpoint`，推送 v2。

## 安全边界

- 上报不需要口令（页面是公开的，口令放页面上等于没有）。接收站只收格式正确的记录、按编号去重、单条 ≤64KB、只接受来自 v2 预览站的跨域请求。内容只有孩子代号、科目、题号/词语对错、用时，没有姓名、学校、照片。
- 读取必须带口令；口令不进仓库、不进对话记录。
- 数据只在家长服务器上；备份就是复制 `data/` 目录。
