#!/bin/bash
# 把接收站收到的记录推送到家长 GitHub 下的私有仓库 eddeyyang/study-records（服务器定时运行）。
# 私钥 /opt/v2-records/.push_key 只在服务器上，GitHub 侧加的是只对该仓库有效的 Deploy key。
set -u
BASE=/opt/v2-records
REPO_DIR=$BASE/repo
REMOTE=git@github.com:eddeyyang/study-records.git
export GIT_SSH_COMMAND="ssh -i $BASE/.push_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
log(){ echo "$(date '+%F %T') $*" >> $BASE/push.log; }

if [ ! -d $REPO_DIR/.git ]; then
  git clone -q $REMOTE $REPO_DIR 2>>$BASE/push.log || { log "clone failed (仓库还没建或 deploy key 未加)"; exit 0; }
  git -C $REPO_DIR config user.name "v2-records"
  git -C $REPO_DIR config user.email "v2-records@localhost"
fi
mkdir -p $REPO_DIR/formal $REPO_DIR/test
rsync -a --exclude '*.tmp' $BASE/data/formal/ $REPO_DIR/formal/ 2>/dev/null
rsync -a --exclude '*.tmp' $BASE/data/test/ $REPO_DIR/test/ 2>/dev/null
cd $REPO_DIR || exit 0
git add -A
if git diff --cached --quiet; then exit 0; fi
git commit -q -m "records $(date '+%F %H:%M')" && git push -q origin HEAD 2>>$BASE/push.log && log "pushed $(git rev-parse --short HEAD)" || log "push failed"
