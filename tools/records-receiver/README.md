# v2 学习记录接收站

孩子在 v2 的软件（听写台、数学错题本）里做完一轮，页面把结果发到这里；Claude 定时读取，写进 Child Study 项目的学情总档。
家长 2026-10-24 定：接收站放在家长自己的腾讯云服务器上。

## 组成

- `receiver.py`：接收程序，Python 3 标准库，无依赖。数据按天一个文件：`data/formal/2026-10-24.jsonl`（正式）、`data/test/…`（家长测试）。
- 页面端：`assets/v2-records.js`；地址在 `data/v2-records-config.json` 的 `endpoint`。为空时不发送，记录只留在孩子设备；填上后自动发送并补发之前排队的记录。
- 读取（2026-10-24 定）：不用口令。服务器每小时跑 `push_records.sh`，把 `data/` 同步到家长 GitHub 下的**私有**仓库 `eddeyyang/study-records`（Deploy key 私钥只在服务器上）；Claude 接入该私有仓库读取，再写进学情总档。`GET /records` 保留但未设口令，一律 403。

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
5. 推送记录到私有仓库：`ssh-keygen -t ed25519 -f /opt/v2-records/.push_key`，把 `.push_key.pub` 作为 Deploy key（勾选写权限）加到私有仓库 `eddeyyang/study-records`；`push_records.sh` 放到 `/opt/v2-records/`，用 systemd timer 每小时跑一次。

## 2026-10-24 实际部署

- 服务器：家长腾讯云轻量 `Ubuntu-ecgq`（lhins-kmcp0g89，新加坡）。入口 `https://124-156-205-59.sslip.io/v2-records/`（复用服务器原有 Nginx 与 Let's Encrypt 证书，自动续期）；在 `sites-available/obsidian-action` 的 server 块里加了一行 `include snippets/v2-records.conf;`，原文件备份为 `obsidian-action.bak-20261024`。防火墙 443 由家长在控制台亲手放通。
- 服务：`v2-records.service`（接收）、`v2-records-push.timer`（每小时推送到私有仓库）。
- 通过 Claude 桌面应用内置浏览器 + 腾讯云 OrcaTerm 免密终端操作，无密钥经过 Claude。

## 安全边界

- 上报不需要口令（页面是公开的，口令放页面上等于没有）。接收站只收格式正确的记录、按编号去重、单条 ≤64KB、只接受来自 v2 预览站的跨域请求。内容只有孩子代号、科目、题号/词语对错、用时，没有姓名、学校、照片。
- 读取必须带口令；口令不进仓库、不进对话记录。
- 数据只在家长服务器上；备份就是复制 `data/` 目录。
