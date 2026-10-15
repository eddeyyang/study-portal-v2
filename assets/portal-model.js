/* Shared navigation model. Browser and Node use the same selection rules. */
(function(root){
'use strict';
const SUBJECTS={'语文':'chinese','古诗':'chinese','数学':'math','英语':'english','外教Preply':'english','编程':'coding','AI':'explore','无人机':'explore','综合':'explore'};
const CHOICES=new Set(['kenton','eddey','both']);
function pathOf(file){return String(file||'').split(/[?#]/)[0];}
function safeFile(file){
 if(typeof file!=='string'||!file||/^[a-z]+:/i.test(file)||file.startsWith('/')||file.includes('\\'))return false;
 try {const decoded=decodeURIComponent(file);return !decoded.startsWith('/')&&!decoded.includes('\\')&&!/^[a-z]+:/i.test(decoded)&&!decoded.split(/[/?#]/).includes('..')&&!/[<>"'\u0000-\u001f]/.test(decoded);}catch{return false;}
}
function day(value){
 const match=String(value||'').match(/^\d{4}-\d{2}-\d{2}$/);
 if(!match)return '';
 const d=new Date(value+'T00:00:00Z');
 return !Number.isNaN(+d)&&d.toISOString().startsWith(value)?value:'';
}
function beijingDay(date=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function updateDate(item){return day(item.updated)||day(item.added)||'';}
function inferredPeriod(item,config){
 const d=day(item.added)||updateDate(item);
 if(d>=config.currentTerm.start&&d<=config.currentTerm.end)return config.currentTerm.id;
 if(d>='2026-07-01'&&d<='2026-08-31')return '2026-summer';
 return 'earlier';
}
function shortTitle(item){
 if(item.displayTitle)return item.displayTitle;
 return String(item.title||'学习内容').replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u,'').split(/[（(]/)[0].replace(/\s*·\s*(认知直达标杆预习|新学期入口).*$/,'').trim();
}
function buildCatalog(data,config){
 const originals=[
 ...(data.apps||[]).map(x=>({...x,sourceIndex:'apps'})),
 ...(data.preply||[]).map(x=>({...x,child:x.child||'both',subject:'外教Preply',group:'speaking',sourceIndex:'preply'})),
 ...(data.papers||[]).map(x=>({...x,kind:'paper',group:'papers',sourceIndex:'papers'})),
 ...(data.podcast||[]).map(x=>({...x,added:x.date,child:'both',subject:'英语',kind:'audio',group:'listening',sourceIndex:'podcast'})),
 ...(config.supplemental||[]).map(x=>({...x,sourceIndex:'supplemental'}))
 ];
 const podcastPaths=new Set((data.podcast||[]).map(x=>pathOf(x.file)));
 const preplyPaths=new Set((data.preply||[]).map(x=>pathOf(x.file)));
 const excluded=new Set(config.unavailableFiles||[]);
 const records=[];
 for(const raw of originals){
  if(!safeFile(raw.file)||!CHOICES.has(raw.child)||excluded.has(pathOf(raw.file)))continue;
  if(/news_\d{8}\.html$/.test(pathOf(raw.file))&&raw.sourceIndex!=='podcast')continue;
  if(raw.sourceIndex==='apps'&&podcastPaths.has(pathOf(raw.file)))continue;
  if(raw.sourceIndex==='apps'&&preplyPaths.has(pathOf(raw.file)))continue;
  const meta={...(raw.navigation||{}),...(config.overrides?.[pathOf(raw.file)]||{})};
  const period=meta.period||inferredPeriod(raw,config);
  const item={...raw,...meta,period,kind:meta.kind||raw.kind||'lesson',subjectId:SUBJECTS[raw.subject]||'explore'};
  item.state=meta.state||(period===config.currentTerm.id?'active':'archive');
  item.updatedAt=updateDate(raw);
  item.displayTitle=shortTitle(item);
  item.group=meta.group||raw.group||(item.kind==='paper'?'papers':item.subjectId==='math'?'units':'lessons');
  if(item.state!=='unavailable')records.push(item);
 }
 // Preserve child-specific variants; collapse only identical child + full URL.
 const unique=new Map();
 for(const item of records){
  const key=item.child+'|'+item.file;
  const old=unique.get(key);
  if(!old||item.updatedAt>old.updatedAt)unique.set(key,item);
 }
 return [...unique.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.displayTitle.localeCompare(b.displayTitle,'zh-CN'));
}
function forChild(items,who){return CHOICES.has(who)&&who!=='both'?items.filter(x=>x.child===who||x.child==='both'):items.slice();}
function latest(items,who,config,today=beijingDay()){
 return forChild(items,who).filter(x=>x.state==='active'&&x.period===config.currentTerm.id&&x.kind==='lesson'&&x.updatedAt&&x.updatedAt<=today).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||((a.child==='both')-(b.child==='both')))[0]||null;
}
function filter(items,options={}){
 const {who,subject,period,kind,query='',group}=options;
 const needle=query.trim().toLocaleLowerCase();
 return forChild(items,who).filter(x=>(!subject||x.subjectId===subject)&&(!period||x.period===period)&&(!kind||x.kind===kind)&&(!group||x.group===group)&&(!needle||(x.displayTitle+' '+x.title+' '+(x.summary||'')).toLocaleLowerCase().includes(needle)));
}
const API={SUBJECTS,pathOf,safeFile,day,beijingDay,updateDate,shortTitle,buildCatalog,forChild,latest,filter};
root.StudyPortalNav=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
