(function(){
'use strict';
const M=window.StudyPortalNav;
const root=document.getElementById('portal-content');
const page=document.body.dataset.portalPage||'home';
const q=new URLSearchParams(location.search);
const state={who:['kenton','eddey'].includes(q.get('who'))?q.get('who'):'both',subject:q.get('subject')||'',period:q.get('period')||'',group:q.get('group')||'',query:q.get('q')||''};
const names={kenton:'哥哥 · Kenton',eddey:'弟弟 · Eddey',both:'两个人'};
const groups={units:'教材单元',calculation:'计算练习',papers:'试卷与打印',words:'词汇与默写',reading:'阅读与背诵',speaking:'外教课复习',listening:'听力与播报',lessons:'专题学习'};
let config,catalog;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=(body,cls='icon',view='0 0 24 24')=>`<svg class="${cls}" viewBox="${view}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
const arrow=()=>svg('<path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>','arrow');
const icon=(name)=>svg(({calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18M8 14h2m4 0h2m-8 3h2"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-40 12 12)"/><circle cx="19" cy="5" r="2" fill="currentColor"/>'}[name]||'').replaceAll('/>',' stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'));
function art(name,cls='book-art'){
 const artwork={
 schedule:`<ellipse cx="165" cy="185" rx="140" ry="13" fill="#c6c7dc" opacity=".45"/>
 <g stroke="#46516b" stroke-width="2" stroke-linejoin="round"><path d="m22 105 197-53 80 54-190 65z" fill="#c7c4e4"/><path d="m22 105 87 66v16l-87-65z" fill="#afa9d1"/><path d="m109 171 190-65v16l-190 65z" fill="#dad8ec"/>
 <path d="m37 98 174-46 65 44-173 58z" fill="#fffdf5"/>
 <path class="itinerary-line" d="m78 110 40-12 35 13 64-23" fill="none" stroke="#8d81b2" stroke-width="3" stroke-dasharray="5 5"/>
 <circle cx="77" cy="110" r="6" fill="#49bbc9"/><circle cx="217" cy="88" r="6" fill="#ef946d"/>
 <g transform="translate(70 58)"><rect x="-17" y="-14" width="42" height="42" rx="13" fill="#d1f0f2"/><path d="m-7 1 11-4 10 4v14L3 19-7 15z" fill="#fffdf6"/><path d="M3-3v22M-7 1l10 5 11-5" fill="none"/></g>
 <g transform="translate(202 33)"><rect x="-14" y="-10" width="43" height="43" rx="13" fill="#ffdcc6"/><path d="M-3 13h20M7 3v20" stroke-linecap="round"/><circle cx="7" cy="13" r="13" fill="none"/></g>
 <g transform="translate(237 125)"><path d="m0 24 20-26 24 24" fill="#fff4c5"/><rect x="0" y="22" width="44" height="30" rx="8" fill="#f4c965"/><path d="M13 34h18M17 43h10" stroke-linecap="round"/></g>
 <g transform="translate(126 35)"><circle cx="20" cy="20" r="22" fill="#fffdf5"/><circle cx="20" cy="20" r="16" fill="#f2ecce"/><path d="M20 9v12l9 5" fill="none" stroke-linecap="round"/></g></g>`,
 chinese:`<ellipse cx="102" cy="126" rx="75" ry="9" fill="#d9d2e9"/><g stroke="#55516e" stroke-width="2" stroke-linejoin="round"><path d="m30 64 133-35-49 88-18-36z" fill="#fffdf6"/><path d="m30 64 66 17 67-52-87 42z" fill="#dfd2eb"/><path d="m96 81 18 36 5-48 44-40z" fill="#c2b2d7"/><path d="m96 81 67-52" fill="none"/><path class="story-flight" d="M40 99c-29-16-23 23 0 18 22-4 20-14 11-18" fill="none" stroke="#a394b9" stroke-dasharray="4 5"/><path d="M40 35h22m-15-9v18m117 56h15m-8-8v16" stroke="#9482ad" stroke-linecap="round"/></g>`,
 math:`<ellipse cx="101" cy="133" rx="75" ry="8" fill="#c8dcd1"/><g stroke="#3e6564" stroke-width="2" stroke-linejoin="round"><path d="m100 66-29 63h58z" fill="#fff3c8"/><circle cx="100" cy="69" r="8" fill="#ecbb58"/><path d="M36 56h128" stroke-width="5" stroke-linecap="round"/><path d="m53 59-25 39h49zM147 59l-25 39h49z" fill="#f7fcf6"/><path d="M28 99q25 23 49 0m45 0q25 23 49 0" fill="#a3d6c8"/>
 <rect x="40" y="69" width="26" height="27" rx="5" fill="#8bc9bd"/><circle cx="144" cy="83" r="14" fill="#d6ebdf"/><path d="M94 28h12m-6-6v12m67-3h11" stroke-linecap="round"/></g>`,
 english:`<ellipse cx="102" cy="130" rx="75" ry="8" fill="#d5dde8"/><g stroke="#4d637b" stroke-width="2" stroke-linejoin="round"><rect x="22" y="27" width="112" height="63" rx="22" fill="#fffdf5"/><path d="m46 89-3 16 24-16" fill="#fffdf5"/><path d="M87 79q0-16 17-16h57q17 0 17 16v22q0 16-17 16h-10l9 15-30-15h-26q-17 0-17-16z" fill="#b9d9e4"/></g><text x="38" y="61" fill="#4d637b" font-family="system-ui,sans-serif" font-size="24" font-weight="700">Hello!</text><text x="112" y="100" fill="#3c5973" font-family="system-ui,sans-serif" font-size="24" font-weight="700">Hi!</text>`,
 coding:`<ellipse cx="100" cy="135" rx="74" ry="8" fill="#d4d0e5"/><g stroke="#53506e" stroke-width="2" stroke-linejoin="round"><rect x="34" y="26" width="133" height="84" rx="15" fill="#fffdf5"/><rect x="44" y="36" width="113" height="64" rx="8" fill="#dfd9ee"/><path d="m76 53-15 15 15 15m49-30 15 15-15 15m-18-35-11 41" fill="none" stroke-width="4" stroke-linecap="round"/><path d="M82 112v13m37-13v13m-49 0h61" fill="none" stroke-width="4" stroke-linecap="round"/></g>`,
 explore:`<ellipse cx="102" cy="134" rx="72" ry="8" fill="#d2ded0"/><g stroke="#49675c" stroke-width="2" stroke-linejoin="round"><path d="m99 89-30 41m33-41 31 41m-33-41v43" stroke-width="5" stroke-linecap="round"/><path d="m42 48 101-26 18 45-102 28z" fill="#c4dfd0"/><path d="m127 26 16-4 18 45-16 5z" fill="#8db4a0"/><ellipse cx="53" cy="72" rx="12" ry="25" transform="rotate(-21 53 72)" fill="#f9f6df"/><ellipse cx="51" cy="72" rx="7" ry="17" transform="rotate(-21 51 72)" fill="#b9dbe0"/><path d="m29 27 4-8 4 8 8 4-8 4-4 8-4-8-8-4z" fill="#f0c665"/></g>`
 };
 return svg(artwork[name]||artwork.explore,cls,name==='schedule'?'0 0 320 210':'0 0 200 150');
}
function companion(who){return `<svg class="companion" viewBox="0 0 94 94" aria-hidden="true"><ellipse cx="47" cy="83" rx="32" ry="6" fill="var(--kid-shadow)"/><g stroke="#46516b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M47 21V11"/><circle cx="47" cy="9" r="4" fill="#f4cd75"/><rect x="15" y="22" width="64" height="53" rx="18" fill="var(--kid-tint)"/><rect x="23" y="31" width="48" height="27" rx="11" fill="#fffef7"/><path d="M36 41v6m22-6v6m-14 3q4 3 8 0"/><path d="m28 75-5 8m43-8 5 8M15 46l-9 5m73-5 8-9"/><path d="M40 65h14"/></g></svg>`;}
function subjectURL(subject,extra={}){const p=new URLSearchParams({subject,...(state.who!=='both'?{who:state.who}:{}),...extra});return 'subject.html?'+p.toString();}
function libraryURL(period='all'){const p=new URLSearchParams({period,...(state.who!=='both'?{who:state.who}:{})});return 'apps.html?'+p.toString();}
function entryURL(item,who=state.who){
 if(item.child!=='both'||!['kenton','eddey'].includes(who))return item.file;
 const url=new URL(item.file,'https://portal.invalid/');
 if(!url.searchParams.has('who'))url.searchParams.set('who',who);
 return url.pathname.slice(1)+url.search+url.hash;
}
function periodLabel(id){return config.periods.find(x=>x.id===id)?.label||(id==='all'?'全部时段':'本学期');}
function statusLabel(item){return item.updatedAt?(item.updated?'更新于 ':'加入于 ')+item.updatedAt.slice(5).replace('-','.'):'历史内容';}
function lessonRow(item,i){return `<a class="lesson-row" href="${esc(entryURL(item))}"><span class="row-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div class="row-content"><h3>${esc(item.displayTitle)}</h3>${item.summary?`<p>${esc(item.summary)}</p>`:''}<div class="row-meta"><span class="kid-badge ${esc(item.child)}">${esc(item.child==='both'?'共同内容':names[item.child])}</span><span>${esc(config.subjects.find(s=>s.id===item.subjectId)?.label||'探索')}</span><span>${esc(groups[item.group]||'专题学习')}</span><span>${esc(statusLabel(item))}</span>${item.state==='archive'?`<span>${esc(periodLabel(item.period))}</span>`:''}</div></div>${arrow()}</a>`;}
function childCard(who){
 const item=M.latest(catalog,who,config);
 return `<article class="child-card ${who}"><div class="child-top"><span class="child-initial" aria-hidden="true">${who==='kenton'?'K':'E'}</span><div><h3>${names[who]}</h3><p>你的学习工作台</p></div>${item?`<span class="update-label">${esc(statusLabel(item))}</span>`:''}</div>${companion(who)}${item?`<p class="lesson-title">${esc(item.displayTitle)}</p><p class="lesson-summary">${esc(item.summary||'打开就能开始这次学习')}</p><a class="start-link" data-latest-for="${who}" href="${esc(entryURL(item,who))}"><span>开始学习</span>${arrow()}</a>`:'<p class="lesson-title">去学科里找一找</p><p class="lesson-summary">本学期还没有可显示的新内容。</p>'}<div class="child-foot"><a href="today.html?who=${who}">按学科选内容</a><a href="mistakes.html?who=${who}">错题与复习</a></div></article>`;
}
function subjectBooks(){return `<div class="subject-grid">${config.subjects.slice(0,3).map((s,i)=>`<a class="subject-book ${s.id}" href="${esc(subjectURL(s.id))}"><div class="book-top"><span>${({chinese:"故事与表达",math:"数量与发现",english:"声音与交流"})[s.id]}</span><span>本学期 · 暑假</span></div>${art(s.id)}<div class="book-bottom"><div><h3>${esc(s.label)}</h3><p>${esc(s.tagline)}</p></div>${arrow()}</div></a>`).join('')}</div><nav class="more-subjects" aria-label="其他学科"><a href="${esc(subjectURL('coding'))}">${icon('code')}编程与代码${arrow()}</a><a href="${esc(subjectURL('explore'))}">${icon('orbit')}探索与实践${arrow()}</a></nav>`;}
function archives(){return `<details class="quiet-area"><summary>以前学过的 · 资料与记录</summary><div class="quiet-links"><a href="${esc(libraryURL())}">全部学习内容${arrow()}</a><a href="${esc(libraryURL('2026-summer'))}">暑假软件${arrow()}</a><a href="${esc(libraryURL('earlier'))}">以前的软件${arrow()}</a>${config.archiveLinks.map(x=>`<a href="${esc(x.file)}">${esc(x.title)}${arrow()}</a>`).join('')}<a href="parent.html">学习记录与家长页${arrow()}</a></div></details>`;}
/* 今日天空：天空颜色、太阳/月亮位置跟着真实时间走。?hour=7.5 仅用于预览不同时段。 */
function skyNow(){
 const now=new Date(),fmt=o=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',...o}).format(now);
 const hm=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':').map(Number);
 const forced=Number(q.get('hour'));
 const h=q.has('hour')&&forced>=0&&forced<24?forced:hm[0]+hm[1]/60;
 const phase=h>=5&&h<7.5?'dawn':h>=7.5&&h<16.5?'day':h>=16.5&&h<19?'dusk':'night';
 const greet=h<5?'夜深了':h<11?'早上好':h<13.5?'中午好':h<18.5?'下午好':'晚上好';
 const t=phase==='night'?(h>=19?(h-19)/10:(h+5)/10):Math.min(.93,Math.max(.05,(h-6)/12));
 return {phase,greet,t,date:fmt({month:'long',day:'numeric'}),week:fmt({weekday:'long'})};
}
function arcPoint(t){const a=[480,270],c=[770,-190],b=[1060,262],u=1-t;return [u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]];}
function skyHero(){
 const s=skyNow(),[x,y]=arcPoint(s.t);
 const stars=[[540,60,1.6],[610,140,1.2],[700,38,1.4],[840,92,1.1],[905,44,1.7],[1010,78,1.3],[1060,170,1],[650,210,1],[960,196,1.2],[380,70,1.3],[260,40,1.1],[120,96,1.4]].map(([cx,cy,r])=>`<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('');
 const cloud='<path d="M0 30c0-13 11-22 24-20 4-9 13-14 23-12 9 2 15 8 17 16 10-1 19 7 18 17 0 6-5 11-11 11H10C4 42 0 37 0 30z"/>';
 const scene=`<svg class="sky-scene" viewBox="0 0 1100 360" preserveAspectRatio="xMaxYMax slice" aria-hidden="true"><defs><radialGradient id="sky-glow"><stop offset="0" style="stop-color:var(--sun);stop-opacity:.6"/><stop offset=".45" style="stop-color:var(--sun);stop-opacity:.18"/><stop offset="1" style="stop-color:var(--sun);stop-opacity:0"/></radialGradient><linearGradient id="sky-hill-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hill-1a)"/><stop offset="1" style="stop-color:var(--hill-1b)"/></linearGradient><linearGradient id="sky-hill-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hill-2a)"/><stop offset="1" style="stop-color:var(--hill-2b)"/></linearGradient><linearGradient id="sky-cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cloud-top)"/><stop offset="1" style="stop-color:var(--cloud-low)"/></linearGradient><linearGradient id="sky-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--haze);stop-opacity:0"/><stop offset="1" style="stop-color:var(--haze);stop-opacity:.55"/></linearGradient><mask id="sky-crescent"><circle r="26" fill="#fff"/><circle cx="12" cy="-9" r="22" fill="#000"/></mask></defs>
<rect class="sky-haze" x="0" y="150" width="1100" height="210" fill="url(#sky-haze)"/><g class="sky-stars">${stars}</g>
<path class="sky-arc" d="M480 270Q770-190 1060 262" fill="none"/>
<g class="sky-cloud" transform="translate(585 92) scale(1.25)" fill="url(#sky-cloud)">${cloud}</g><g class="sky-cloud far" transform="translate(965 150) scale(.85)" fill="url(#sky-cloud)">${cloud}</g>
<g class="sky-body" style="--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="84" fill="url(#sky-glow)"/><circle class="sun-core" r="27"/><g class="moon-core" mask="url(#sky-crescent)"><circle r="26"/></g></g>
<path class="sky-hill far" d="M0 300C120 286 230 262 360 258S560 246 690 224 840 196 930 204 1060 236 1100 244V360H0z"/><g class="sky-birds" fill="none"><path d="M690 186q7-6 13 0q6-6 13 0"/><path d="M728 168q5-4 9 0q4-4 9 0"/></g><path class="sky-hill back" d="M0 334C210 326 400 300 620 274S900 240 1100 256V360H0z" fill="url(#sky-hill-back)"/>
<g class="sky-kids" transform="translate(866 208) scale(1.25)"><g class="kid kenton"><rect x="0" y="22" width="22" height="34" rx="11"/><circle class="face" cx="11" cy="12" r="10"/><path class="hair" d="M1 11c0-7 5-11 10-11s10 4 10 11c-3-3-7-4-10-4S4 8 1 11z"/><path class="leg" d="M7 54v10m8-10v10"/></g><g class="kid eddey" transform="translate(32 12)"><rect x="0" y="22" width="20" height="28" rx="10"/><circle class="face" cx="10" cy="12" r="9.5"/><path class="hair" d="M.6 11C.6 4 5 0 10 0s9.4 4 9.4 11c-3-3-6.4-4-9.4-4S3.6 8 .6 11z"/><path class="arm" d="M18 30l14-14"/><path class="leg" d="M6 48v10m8-10v10"/></g></g>
<path class="sky-hill front" d="M0 350C290 342 540 326 760 304S1000 278 1100 274V360H0z" fill="url(#sky-hill-front)"/></svg>`;
 return `<a class="sky" data-phase="${s.phase}" href="school_day.html" aria-label="查看日程、课程和接送安排">${scene}<div class="sky-copy"><p class="sky-date">${esc(s.date)} ${esc(s.week)}</p><h1><span>${s.greet}，</span><span>今天从这里出发</span></h1><p class="sky-note">上什么课，几点接，课后怎么安排，两个人的日程放在一起看。</p><span class="sky-link">打开日程与接送表${arrow()}</span></div></a>`;
}
function riseSky(){
 const sky=root.querySelector('.sky'),body=sky&&sky.querySelector('.sky-body');
 if(!body)return;
 document.documentElement.dataset.sky=sky.dataset.phase;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const end=skyNow().t,start=Math.max(0,end-.32),t0=performance.now(),dur=1500;
 sky.classList.add('is-rising');
 const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3),[x,y]=arcPoint(start+(end-start)*e);body.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);if(k<1)requestAnimationFrame(step);else sky.classList.remove('is-rising');};
 requestAnimationFrame(step);
}
function home(){
 root.innerHTML=`${skyHero()}<section aria-labelledby="kids-title"><div class="section-heading"><h2 id="kids-title">从你的工作台开始</h2><p>直接打开最近更新的内容</p></div><div class="child-grid">${childCard('kenton')}${childCard('eddey')}</div></section><section aria-labelledby="subjects-title"><div class="section-heading"><h2 id="subjects-title">今天，想探索什么？</h2><p>本学期、暑假和以前的内容都在里面</p></div>${subjectBooks()}</section>${archives()}`;
 riseSky();
}
function childPage(){
 const who=state.who;
 root.innerHTML=`<a class="small-schedule" href="school_day.html"><span>${icon('calendar')}先看日程与接送安排</span>${arrow()}</a><section class="child-page"><div class="section-heading"><h1>${who==='both'?'选一个人，开始学习':esc(who==='kenton'?'Kenton':'Eddey')+' 的学习室'}</h1></div><div class="child-grid ${who==='both'?'':'single'}">${who==='both'?childCard('kenton')+childCard('eddey'):childCard(who)}</div></section><section aria-labelledby="subjects-title"><div class="section-heading"><h2 id="subjects-title">再去探索一点</h2><p>按内容自己选</p></div>${subjectBooks()}</section>${archives()}`;
 document.title=(who==='both'?'孩子学习室':names[who]+'的学习室')+' · 家庭学习室';
}
function buttons(options,key){return options.map(x=>`<button type="button" data-filter="${key}" data-value="${esc(x.id)}" aria-pressed="${state[key]===x.id}">${esc(x.label)}</button>`).join('');}
function catalogPage(){
 const isSubject=page==='subject';
 if(isSubject&&!config.subjects.some(s=>s.id===state.subject))state.subject='math';
 if(!isSubject&&!config.subjects.some(s=>s.id===state.subject))state.subject='';
 if(!config.periods.some(p=>p.id===state.period)&&state.period!=='all')state.period=config.currentTerm.id;
 const s=config.subjects.find(s=>s.id===state.subject);
 document.title=(isSubject?s.label:'全部学习内容')+' · 家庭学习室';
 const collection=state.subject==='math'?[['units','教材单元'],['calculation','计算练习'],['papers','试卷与打印']]:state.subject==='english'?[['words','词汇与默写'],['speaking','外教课复习'],['listening','听力与播报']]:[];
 root.innerHTML=`<nav class="breadcrumbs" aria-label="当前位置"><a href="index.html">学习室</a><span>/</span><span>${esc(isSubject?s.label:'全部学习内容')}</span></nav><header class="page-intro ${esc(state.subject)}"><div class="intro-copy"><span class="eyebrow">${esc(config.currentTerm.label)} · 自己选内容</span><h1>${esc(isSubject?s.label:'学习内容书架')}</h1><p>${esc(isSubject?s.tagline:'最近的学习在前面，以前的内容也都留着。')}</p></div>${art(isSubject?s.id:'chinese','intro-art')}</header><nav class="subject-nav" aria-label="切换学科">${config.subjects.map(s=>`<a href="${esc(subjectURL(s.id))}" ${s.id===state.subject?'aria-current="page"':''}>${esc(s.label)}</a>`).join('')}${!isSubject?'<button type="button" class="text-button" data-filter="subject" data-value="">全部学科</button>':''}</nav><div class="control-row"><div class="segmented" role="group" aria-label="选择孩子">${buttons([{id:'both',label:'两个人'},{id:'kenton',label:'哥哥 Kenton'},{id:'eddey',label:'弟弟 Eddey'}],'who')}</div><label class="search-box">${icon('search')}<span class="sr-only">搜索学习内容</span><input id="catalog-search" type="search" placeholder="找课文、单元或练习…" value="${esc(state.query)}" autocomplete="off"></label></div><div class="filter-line" role="group" aria-label="选择时段">${buttons([...config.periods.filter(x=>x.id!=='exam'),{id:'all',label:'全部时段'},{id:'exam',label:'备考归档'}],'period')}</div>${collection.length?`<nav class="collection-links" aria-label="${esc(s.label)}内容分类">${collection.map(([id,label])=>`<a class="collection-link" href="${esc(subjectURL(state.subject,{group:id,period:id==='units'?config.currentTerm.id:'all'}))}">${label}${arrow()}</a>`).join('')}</nav>`:''}<div id="group-filters" class="filter-line" role="group" aria-label="内容类型"></div><div id="catalog-results" aria-live="polite" aria-atomic="false"></div><details class="quiet-area"><summary>学习记录和其他资料</summary><div class="quiet-links">${state.who==='both'?'<a href="today.html?who=kenton">哥哥的学习室</a><a href="today.html?who=eddey">弟弟的学习室</a>':`<a href="mistakes.html?who=${state.who}">错题与复习</a>`}<a href="parent.html">学习记录与家长页</a><a href="${esc(libraryURL())}">全部学习内容</a></div></details>`;
 root.querySelector('#catalog-search').addEventListener('input',e=>{state.query=e.target.value;updateURL();renderResults();});
 renderResults();
}
function updateURL(){const p=new URLSearchParams(location.search);for(const k of ['who','subject','period','group']){if(state[k]&&!(k==='who'&&state[k]==='both'))p.set(k,state[k]);else p.delete(k);}if(state.query)p.set('q',state.query);else p.delete('q');history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():'')+location.hash);}
function renderResults(){
 const period=state.period==='all'?'':state.period;
 const base=M.filter(catalog,{who:state.who,subject:state.subject,period}).filter(x=>state.period==='exam'||x.period!=='exam');
 const available=[...new Set(base.map(x=>x.group))];
 if(state.group&&!Object.hasOwn(groups,state.group))state.group='';
 const groupOptions=[{id:'',label:'全部类型'},...available.map(id=>({id,label:groups[id]||'专题学习'}))];
 if(state.group&&!available.includes(state.group))groupOptions.push({id:state.group,label:groups[state.group]});
 root.querySelector('#group-filters').innerHTML=buttons(groupOptions,'group');
 const items=M.filter(base,{query:state.query,group:state.group}).sort((a,b)=>(a.state==='archive')-(b.state==='archive')||(a.kind==='hub')-(b.kind==='hub')||b.updatedAt.localeCompare(a.updatedAt));
 const result=root.querySelector('#catalog-results');
 if(!items.length){result.innerHTML=`<div class="empty-state"><h2>这里暂时没有匹配的内容</h2><p>${state.query?'换一个词试试，或清除筛选。':state.group==='calculation'?'计算练习保留在暑假和以前的内容里。':'可以看看其他时段，或切换孩子与内容类型。'}</p><button type="button" class="text-button" data-action="reset">看看其他内容</button></div>`;return;}
 const active=items.filter(x=>x.state!=='archive'),archived=items.filter(x=>x.state==='archive');
 result.innerHTML=(active.length?`<div class="results-heading"><h2>${esc(state.group?groups[state.group]:'本学期的学习')}</h2><span>${active.length} 项 · 按更新排序</span></div>${active.map(lessonRow).join('')}`:'')+(archived.length?`<section aria-label="历史学习内容"><div class="results-heading"><h2>${esc(state.period==='all'?'以前学过的':periodLabel(state.period))}</h2><span>${archived.length} 项</span></div>${state.period==='exam'?'<p class="archive-note">备考内容保留在这里，学习记录继续保存。</p>':''}${archived.map(lessonRow).join('')}</section>`:'');
}
root.addEventListener('click',e=>{
 const btn=e.target.closest('[data-filter],[data-action="reset"]');if(!btn)return;
 if(btn.dataset.action==='reset'){state.query='';state.group='';state.period='all';}
 else state[btn.dataset.filter]=btn.dataset.value;
 updateURL();catalogPage();
 const same=root.querySelector(`[data-filter="${btn.dataset.filter}"][data-value="${CSS.escape(btn.dataset.value||'')}"]`);same?.focus({preventScroll:true});
});
function render(){if(page==='home')home();else if(page==='child')childPage();else catalogPage();root.setAttribute('aria-busy','false');}
async function load(){
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),8000);
 try{
  const paths=['apps','preply','papers','podcast','portal-navigation'];
  const values=await Promise.all(paths.map(async p=>{const r=await fetch('data/'+p+'.json',{cache:'no-store',signal:abort.signal});if(!r.ok)throw new Error(p);return r.json();}));
  if(values.slice(0,4).some(x=>!Array.isArray(x))||values[4]?.schemaVersion!==1||!Array.isArray(values[4]?.subjects)||!Array.isArray(values[4]?.periods))throw new Error('catalog format');
  config=values[4];catalog=M.buildCatalog(Object.fromEntries(paths.slice(0,4).map((p,i)=>[p,values[i]])),config);if(window.V2CourseRoutes)catalog=window.V2CourseRoutes(catalog);render();
 }catch(error){
  const cached=window.StudyPortalSnapshot;
  const notice=document.getElementById('portal-notice');
  if(cached?.config&&Array.isArray(cached.catalog)){config=cached.config;catalog=window.V2CourseRoutes?window.V2CourseRoutes(cached.catalog):cached.catalog;notice.hidden=false;notice.innerHTML=`暂时无法刷新目录，正在显示 ${esc(cached.generatedOn)} 保存的内容。<button type="button" onclick="location.reload()">重新获取</button>`;render();}
  else{notice.hidden=false;notice.textContent='学习目录暂时没有加载成功，请刷新重试。';root.innerHTML='<a class="small-schedule" href="school_day.html">打开日程与接送表</a><div class="quiet-links"><a href="parent.html">学习记录与家长页</a></div>';root.setAttribute('aria-busy','false');}
 }finally{clearTimeout(timer);}
}
load();
})();

