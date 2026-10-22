/* v2 自有文件（同步工具不会碰它）：
   把门户里的“无人机二级”入口指向 Claude 重做的二级航线 apps/drone/。
   只改入口指向和标题，不改目录数据；正式站的原页仍可从航线的家长页打开。 */
window.V2CourseRoutes = function(catalog){
  if(!Array.isArray(catalog)) return catalog;
  return catalog.map(function(item){
    var f = String((item && item.file) || '');
    if(!/^apps\/drone_l2_/.test(f)) return item;
    var m = f.match(/[?&]who=(kenton|eddey)/);
    return Object.assign({}, item, {
      file: 'apps/drone/index.html' + (m ? '?who=' + m[1] : ''),
      displayTitle: '无人机二级航线',
      summary: '9 个航点：为什么能飞、谁先飞上天、怎么飞好。每站先动手，再盖住说、秒答，最后模拟机考。'
    });
  });
};
