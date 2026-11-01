/* v2 自有文件（同步工具不会碰它）：
   把门户目录里的某些入口指向 Claude 重做的 v2 应用。只改入口指向和标题，不改目录数据；
   正式站的原页文件仍在仓库里，可从网址直接打开。
   - 无人机二级 → apps/drone/（2026-10-23）
   - 期中听写桌（语文/英语） → apps/v2/dictation/（2026-10-24）
   - 两孩数学错题本 → apps/v2/math-mistakes/（2026-10-24）
   - 知识连起来（周末复习册，非 memory 节）→ apps/v2/exam-map/ 考前脑图（2026-11-01） */
window.V2CourseRoutes = function(catalog){
  if(!Array.isArray(catalog)) return catalog;
  return catalog.map(function(item){
    var f = String((item && item.file) || '');
    if(/^apps\/drone_l2_/.test(f)){
      var m = f.match(/[?&]who=(kenton|eddey)/);
      return Object.assign({}, item, {
        file: 'apps/drone/index.html' + (m ? '?who=' + m[1] : ''),
        displayTitle: '无人机二级航线',
        summary: '9 个航点：为什么能飞、谁先飞上天、怎么飞好。每站先动手，再盖住说、秒答，最后模拟机考。'
      });
    }
    if(/^apps\/midterm-dictation-20261024\.html/.test(f)){
      var c = (f.match(/[?&]child=(kenton|eddey)/) || [])[1] || item.child || 'eddey';
      var s = (f.match(/[?&]subject=(chinese|english)/) || [])[1] || 'chinese';
      return Object.assign({}, item, {
        file: 'apps/v2/dictation/index.html?who=' + c + '&subject=' + s,
        displayTitle: (s === 'english' ? '英语听写' : '语文听写') + ' · 期中',
        summary: '选几课 → 先看一遍 → 立刻计时逐词报读，本子上写 → 对答案点错 → 错词再默。前四单元词库，逐词真人感录音。'
      });
    }
    if(/^apps\/weekend_review_atlas_20261030\.html/.test(f) && !/[?&]section=memory/.test(f)){
      var ac = (f.match(/[?&]child=(kenton|eddey)/) || [])[1] || item.child || 'eddey';
      var as = (f.match(/[?&]subject=(chinese|math|english)/) || [])[1] || 'math';
      var sn = { chinese: '语文', math: '数学', english: '英语' }[as];
      return Object.assign({}, item, {
        file: 'apps/v2/exam-map/index.html?who=' + ac + '&subject=' + as,
        displayTitle: (ac === 'kenton' ? '哥哥' : '弟弟') + ' · ' + sn + '考前脑图',
        summary: '一张脑图看清单元主线和关键关系；★ 知识重点、红圈错题重点（按这学期错题统计）。点节点先看关系再做 5 题，「快速过一遍」10 题几分钟做完。'
      });
    }
    if(/^apps\/(kenton|eddey)_math_mistakes_20261024\.html/.test(f)){
      var who = f.match(/^apps\/(kenton|eddey)_/)[1];
      return Object.assign({}, item, {
        file: 'apps/v2/math-mistakes/index.html?who=' + who,
        displayTitle: (who === 'kenton' ? '哥哥' : '弟弟') + ' · 数学错题本',
        summary: '每天 10 题，都是这学期错过的。先自己做；错了只给一个关键关系再试，再错看步骤后回原题重做；换天再独立做对才过关。'
      });
    }
    return item;
  });
};
