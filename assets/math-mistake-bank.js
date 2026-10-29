(function(root){
  'use strict';
  const VERSION=1, SCHEMA='study-portal-math-mistakes';
  const text=value=>String(value==null?'':value);
  function normalized(value){return text(value).normalize('NFKC').trim().replace(/\s+/g,'').replace(/[，、；;]/g,',').replace(/[。！!？?]/g,'').replace(/[−－]/g,'-').replace(/[×✕]/g,'*').replace(/[÷]/g,'/').replace(/[（]/g,'(').replace(/[）]/g,')').toLowerCase();}
  function numeric(value){const s=normalized(value).replace(/^[a-z]=/,'');if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return Number(s);const f=s.match(/^([+-]?\d+)\/([+-]?\d+)$/);return f&&Number(f[2])!==0?Number(f[1])/Number(f[2]):null;}
  function rational(value){
    const s=normalized(value).replace(/^[a-z]=/,'');
    const parts=s.split('/');if(parts.length===2){const a=rational(parts[0]),b=rational(parts[1]);return a&&b&&b.n!==0n?{n:a.n*b.d,d:a.d*b.n}:null;}
    const m=s.match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/);
    if(!m||!(m[2]||m[3])||Math.abs(Number(m[4]||0))>1000)return null;
    const exp=Number(m[4]||0)-(m[3]||'').length;let n=BigInt((m[2]||'0')+(m[3]||''));if(m[1]==='-')n=-n;
    return exp>=0?{n:n*10n**BigInt(exp),d:1n}:{n,d:10n**BigInt(-exp)};
  }
  function exactEqual(a,b){const x=rational(a),y=rational(b);return !!(x&&y&&x.n*y.d===y.n*x.d);}
  function roundDecimal(value,places){const r=rational(value);if(!r||places<0||places>8)return '';const sign=r.n<0n?'-':'';const n=r.n<0n?-r.n:r.n;const scale=10n**BigInt(places);const whole=(n*scale*2n+r.d)/(r.d*2n);const digits=whole.toString().padStart(places+1,'0');return sign+(places?digits.slice(0,-places)+'.'+digits.slice(-places):digits);}
  function expression(value){let s=normalized(value).replace(/[\[\{]/g,'(').replace(/[\]\}]/g,')').split('=')[0];while(s.startsWith('(')&&s.endsWith(')')){let d=0,outer=true;for(let i=0;i<s.length-1;i++){if(s[i]==='(')d++;if(s[i]===')')d--;if(d===0){outer=false;break;}}if(!outer)break;s=s.slice(1,-1);}return s;}
  function evaluateExpression(value){
    const s=expression(value);if(s.length>500||!/^[\d.+*/()\-]+$/.test(s))return null;
    const tokens=s.match(/\d+(?:\.\d+)?|[()+*/-]/g)||[];if(tokens.join('')!==s)return null;let i=0;
    const add=(a,b,sign=1n)=>({n:a.n*b.d+sign*b.n*a.d,d:a.d*b.d});
    function factor(){if(tokens[i]==='('){i++;const x=sum();if(tokens[i++]!==')')throw 0;return x;}if(tokens[i]==='-'){i++;const x=factor();return {n:-x.n,d:x.d};}const x=rational(tokens[i++]);if(!x)throw 0;return x;}
    function term(){let x=factor();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],y=factor();if(op==='/'&&y.n===0n)throw 0;x=op==='*'?{n:x.n*y.n,d:x.d*y.d}:{n:x.n*y.d,d:x.d*y.n};}return x;}
    function sum(){let x=term();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++];x=add(x,term(),op==='+'?1n:-1n);}return x;}
    try{const result=sum();return i===tokens.length?result:null;}catch(_){return null;}
  }
  function expressionEqual(input,target){
    if(expression(input)!==expression(target))return false;
    const parts=normalized(input).split('=');if(parts.length===1)return true;if(parts.length!==2)return false;
    const rhs=rational(parts[1]),lhs=evaluateExpression(parts[0]);return !!(rhs&&lhs&&rhs.n*lhs.d===lhs.n*rhs.d);
  }
  function judge(q,value){
    if(!text(value).trim())return {empty:true,correct:false};
    const answers=(q.answers||[]).map(text);
    if(q.kind==='manual'||q.kind==='open'||['过程复查','process-gap'].includes(q.recordType)||!answers.length)return {manual:true,correct:null};
    let input=normalized(value);if(q.unit)input=input.replace(new RegExp(text(q.unit).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'), '');
    if(q.answerFormat==='brackets'){
      const parts=input.split('='),left=parts[0],base=expression(q.baseExpression||answers[0]);
      const sequence=s=>expression(s).replace(/[()]/g,'');
      const result=evaluateExpression(left),expected=rational(q.expectedValue),rhs=parts.length===2?rational(parts[1]):null;
      const correct=parts.length<=2&&sequence(left)===sequence(base)&&!!(result&&expected&&result.n*expected.d===expected.n*result.d)&&(parts.length===1||!!(rhs&&result&&rhs.n*result.d===result.n*rhs.d));
      return {correct};
    }
    if(q.answerFormat==='expression-result'){
      // Opt-in result questions may include working. Verify every equality
      // segment; never accept a false calculation just because its RHS matches.
      const raw=text(value).normalize('NFKC').replace(/\s+/g,'');
      if(raw.length>1000||!/^[\d.+*/=()\[\]{}×✕÷−-]+$/.test(raw))return {correct:false};
      const closing={'(':')','[':']','{':'}'},stack=[];
      for(const symbol of raw){if(closing[symbol])stack.push(closing[symbol]);else if(')]}'.includes(symbol)&&stack.pop()!==symbol)return {correct:false};}
      if(stack.length)return {correct:false};
      const values=input.split('=').map(part=>rational(part)||evaluateExpression(part));
      const correct=answers.some(answer=>{const expected=rational(answer);return expected&&values.every(value=>value&&value.n*expected.d===expected.n*value.d);});
      return {correct};
    }
    const synonyms={'正确':'对','是':'对','√':'对','true':'对','错误':'错','否':'错','×':'错','false':'错','*':'错'};
    let correct=answers.some(a=>{const target=normalized(a);return input===target||(q.kind==='text'&&/[+*/()\[\]-]/.test(target)&&expressionEqual(input,target))||(synonyms[input]&&synonyms[input]===(synonyms[target]||target));});
    if(q.kind==='text'&&answers.some(a=>normalized(a).includes(','))&&input.includes(',')){
      const parts=input.split(','),precisions=q.perAnswerDecimals;
      correct=answers.some(a=>{const expected=normalized(a).split(',');return expected.length===parts.length&&expected.every((v,i)=>exactEqual(parts[i],v));});
      if(correct&&Array.isArray(precisions)&&precisions.some((p,i)=>Number.isInteger(p)&&!new RegExp('^[+-]?\\d+\\.\\d{'+p+'}$').test(parts[i])))return {correct:false,formatOnly:true,message:'数值对应了。请按各空要求补足小数位，末尾的0也要写。'};
    }
    const places=q.precision??q.decimalPlaces??q.requiredDecimals;
    if(q.kind==='number'||answers.every(a=>numeric(a)!==null)){
      const valueNumber=numeric(input);
      if(valueNumber!==null)correct=answers.some(a=>numeric(a)!==null&&exactEqual(input,a));
      if(correct&&Number.isInteger(places)){
        const strict=new RegExp('^[+-]?\\d+\\.\\d{'+places+'}$');
        if(!strict.test(input))return {correct:false,formatOnly:true,message:'数值对了。这题要保留'+places+'位小数，末尾的0也要写。'};
      }
    }
    return {correct};
  }
  function dayKey(at){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at||Date.now()));}
  function progress(attempts){
    if(!attempts.length)return {key:'new',label:'待练',review:true};
    const last=attempts[attempts.length-1];
    if(!last.correct||!last.independent)return {key:'review',label:'待复查',review:true};
    const successDays=new Set();
    for(let i=attempts.length-1;i>=0;i--){const a=attempts[i];if(!a.correct||!a.independent)break;successDays.add(dayKey(a.at));}
    if(successDays.size>=2)return {key:'mastered',label:'跨日通过',review:false};
    return {key:'once',label:'再验一次',review:true};
  }
  function validImport(data,child,appId,ids,mode){
    if(!data||data.schema!==SCHEMA||data.version!==VERSION)throw new Error('文件格式或版本不匹配，原记录没有改动。');
    if(data.child!==child||data.appId!==appId)throw new Error('这不是当前孩子的这份错题库记录，原记录没有改动。');
    if(!['test','formal'].includes(data.mode)||data.mode!==mode)throw new Error('测试记录和正式记录不能互相导入，原记录没有改动。');
    if(!Array.isArray(data.attempts)||data.attempts.length>10000)throw new Error('记录内容不完整或过大。');
    const known=new Set(ids),seen=new Set();
    for(const a of data.attempts){if(!a||typeof a.id!=='string'||a.mode!==mode||seen.has(a.id)||!known.has(a.questionId)||!Number.isFinite(Date.parse(a.at))||![true,false,null].includes(a.correct)||typeof a.independent!=='boolean'||(a.independent&&(!a.correct||a.hintUsed||a.referenceSeen))||text(a.answer).length>4000)throw new Error('有一条练习记录无法核对，原记录没有改动。');seen.add(a.id);}
    return data;
  }
  function isImportant(q){return q.priority==='important'||q.priority==='high'||q.important===true||['important-review','重要复验'].includes(q.recordType);}
  function selectModel(q){
    const n='(\\d+(?:\\.\\d+)?)',prompt=text(q.prompt).split(/\r?\n/).map(normalized).join('|');
    // Each step is a separate expression: never concatenate a prior result with
    // the next step's first factor (for example, trailing 71 followed by 26).
    const steps=(Array.isArray(q.steps)?q.steps:[]).flatMap(value=>text(value).split(/\r?\n/)).map(normalized);
    if(/保留|精确|近似/.test(q.prompt)){
      const places=q.precision??q.decimalPlaces??q.requiredDecimals??(/千分位|三位|3位/.test(q.prompt)?3:/百分位|两位|二位|2位/.test(q.prompt)?2:/十分位|一位|1位/.test(q.prompt)?1:null);
      if(q.kind!=='number'||!Number.isInteger(places)||places<1||places>3||q.perAnswerDecimals||(q.answers||[]).length!==1)return null;
      const m=prompt.match(new RegExp(n+'\\/'+n));
      if(m){const raw=m[1]+'/'+m[2],r=rational(raw);if(r&&r.d!==0n&&exactEqual(roundDecimal(raw,places),q.answers[0]))return {type:'round',raw,expression:m[1]+' ÷ '+m[2],value:places,sourceExpression:m[0],sourceStep:prompt};}
      return null;
    }
    for(const sourceStep of steps){
      const split=sourceStep.match(new RegExp(n+'\\*\\('+n+'([+-])'+n+'\\)'));
      if(split){const a=Number(split[1]),b=Number(split[2]),value=Number(split[4]);if(a>=0&&b>=0&&value>=0&&(split[3]!=='-'||value<=b))return {type:'split',a,b,sign:split[3],value,sourceExpression:split[0],sourceStep};}
    }
    const product=prompt.match(new RegExp(n+'\\*'+n));
    if(product){const a=Number(product[1]),v=Number(product[2]);if(a<=1000&&v>=1&&v<=1000){const b=v>=10?Math.floor(v/10)*10:Math.floor(v);return {type:'split',a,b,sign:'+',value:Number((v-b).toFixed(5)),sourceExpression:product[0],sourceStep:prompt};}}
    return null;
  }
  function safeAsset(value){
    if(typeof value!=='string')return '';
    const clean=value.replace(/^\.\.\//,'');
    if(!/^assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:svg|png|webp|jpe?g)$/.test(clean))return '';
    return '../'+clean;
  }
  function sourceRows(q){
    const s=q.source||{},kind={original:'原题重练',reconstructed:'依据已核条件整理的练习',transfer:'新编迁移题，不计入历史错题'}[s.kind]||'来源形式待核';
    const rows=[['材料',s.material||s.label||'材料名称待核'],['对应内容',s.material&&s.label&&s.material!==s.label?s.label:''],[s.dateLabel||'材料／记录日期',s.date||'日期未核实'],['日期含义',s.dateMeaning||''],['纸面页码',s.page||'现有记录未核实纸面页码'],['扫描页',s.scanPage||''],['题号',s.question||'现有记录未核实题号'],['收录形式',kind]];
    if(s.locatorStatus){const value={verified:'材料位置已核对',partial:'部分位置已核对，其余以待核项为准',unverified:'材料位置待核',missing:'原始位置尚缺',record:'依据已保存记录定位'}[s.locatorStatus]||(/[\u3400-\u9fff]/.test(s.locatorStatus)?s.locatorStatus:'以已核字段为准');rows.push(['定位状态',value]);}
    if(s.note)rows.push(['来源说明',s.note]);
    if(q.image){let caption=q.diagramCaption||q.visual?.caption||'按已核条件绘制';if(!caption.includes('非原卷截图'))caption=caption.replace(/[。；;]$/,'')+'；条件示意，非原卷截图';rows.push(['题图说明',caption]);}
    return rows.filter(row=>row[1]);
  }
  function teachingFigures(q,includeQuestion=false){
    const figures=[];
    if(includeQuestion&&safeAsset(q.image))figures.push({src:q.image,alt:q.diagramAlt||q.visual?.alt||'题目条件图',caption:q.diagramCaption||'先对照题目条件'});
    const raw=[...(q.teachingImage?[q.teachingImage]:[]),...(Array.isArray(q.teachingImages)?q.teachingImages:[])];
    for(const item of raw){const f=typeof item==='string'?{src:item}:item;if(f&&safeAsset(f.src||f.image)&&!figures.some(x=>x.src===(f.src||f.image)))figures.push({src:f.src||f.image,alt:f.alt||q.visual?.alt||'本题方法图解',caption:f.caption||q.visual?.caption||'教学示意 · 用图看清数量关系'});}
    return figures;
  }
  function knowledgeRoutes(bank){
    const list=(bank.items||[]).filter(q=>q.status!=='needs-source'&&q.status!=='excluded'&&q.prompt&&q.id),categories=[...new Set(list.map(q=>q.category||'数学'))],syllabus=Array.isArray(bank.syllabus)?bank.syllabus:[];
    const ordered=[...syllabus.map(x=>x.category).filter(c=>categories.includes(c)),...categories.filter(c=>!syllabus.some(x=>x.category===c))];
    return [...new Set(ordered)].map(category=>{
      const questions=list.filter(q=>(q.category||'数学')===category),spec=syllabus.find(x=>x.category===category)||{},first=questions[0],counts={};
      for(const q of questions){const type=q.diagnosis?.type||'关键步骤';counts[type]=(counts[type]||0)+1;}
      const prerequisites=Array.isArray(spec.prerequisites)?spec.prerequisites:[...new Set(questions.flatMap(q=>Array.isArray(q.teaching?.prerequisites)?q.teaching.prerequisites:[]))].slice(0,4);
      return {category,title:spec.title||category,count:questions.length,prerequisites,coreInsight:spec.coreInsight||first.teaching?.goal||'先看懂题中的关系，再用自己的步骤完成。',sequence:spec.sequence,check:spec.check||first.teaching?.recallPrompt||'遮住方法，说清第一步为什么这样做。',diagnoses:Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([type,count])=>({type,count}))};
    });
  }
  const core={normalized,numeric,rational,exactEqual,roundDecimal,expression,evaluateExpression,expressionEqual,judge,dayKey,progress,validImport,isImportant,selectModel,safeAsset,sourceRows,teachingFigures,knowledgeRoutes};root.MathMistakeCore=core;
  if(typeof document==='undefined')return;
  const config=root.MATH_BANK_CONFIG;if(!config)return;
  const $=id=>document.getElementById(id), child=config.child,appId=config.appId;
  const query=new URLSearchParams(location.search),explicitTest=query.get('test')==='1';
  if(explicitTest&&root.DDLearningSync&&!root.DDLearningSync.isTest())root.DDLearningSync.startTest();
  const test=explicitTest||!root.DDLearningSync||root.DDLearningSync.isTest();
  const key=`study:${child}:${appId}:v1:${test?'test':'formal'}`;
  let bank,items=[],current,modelSpec=null,modelValue=null,modelDisplay='figure',filter='all',category='all',diagnosis='all',search='',step=0,assisted=false,referenceSeen=false,blocking=0,checked=false,currentView='question',activeStart=Date.now(),storageLocked=false,rawRecovery=null;
  let state={schema:SCHEMA,version:VERSION,child,appId,mode:test?'test':'formal',attempts:[],drafts:{},helpDays:{},currentId:null,seconds:0,queuedIds:[]};
  const iconArrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
  const escape=s=>text(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid=()=>root.crypto&&root.crypto.randomUUID?root.crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  function save(){if(storageLocked){$('saveLabel').textContent='旧记录待恢复，当前作答暂存；请导出备份';return;}try{state.seconds+=Math.max(0,(Date.now()-activeStart)/1000);activeStart=Date.now();localStorage.setItem(key,JSON.stringify(state));$('saveLabel').textContent='已保存在这台设备';}catch(_){$('saveLabel').textContent='浏览器暂时无法保存，请先导出记录';}}
  function attemptsFor(id){return state.attempts.filter(a=>a.questionId===id);}
  function getProgress(id){return progress(attemptsFor(id));}
  function recordLabel(q){const t=q.recordType;return ['process-gap','过程复查'].includes(t)?'过程复查':['important-review','重要复验'].includes(t)?'重要复验':'错题重练';}
  function filtered(){return items.filter(q=>(category==='all'||q.category===category)&&(diagnosis==='all'||q.diagnosis?.type===diagnosis)&&(!search||[q.prompt,q.title,q.category,q.source?.material,q.source?.label,q.diagnosis?.type,q.diagnosis?.breakpoint].join(' ').includes(search))&&(filter==='all'||(filter==='important'&&isImportant(q))||(filter==='review'&&getProgress(q.id).review)));}
  function figureMarkup(q,includeQuestion=false){
    const method=teachingFigures(q),figures=method.length?method:teachingFigures(q,includeQuestion);
    return figures.map((f,i)=>`<figure class="teaching-figure" data-figure-index="${i}"${i?' hidden':''}><img src="${escape(safeAsset(f.src))}" alt="${escape(f.alt)}"><div class="figure-footer"><figcaption>${escape(f.caption)}</figcaption><button class="figure-zoom" type="button" data-zoom-src="${escape(safeAsset(f.src))}" data-zoom-alt="${escape(f.alt)}" data-zoom-caption="${escape(f.caption)}">放大看</button></div></figure>`).join('')+(figures.length>1?`<div class="figure-pages" aria-label="图解步骤">${figures.map((_,i)=>`<button type="button" data-figure-page="${i}" aria-pressed="${i===0}">图 ${i+1}</button>`).join('')}</div>`:'');
  }
  function renderRoutes(){
    $('routeList').innerHTML=knowledgeRoutes(bank).map((route,index)=>`<li><details class="route-node"${index===0?' open':''}><summary><span class="route-number">${String(index+1).padStart(2,'0')}</span><span><strong>${escape(route.title)}</strong><small>${escape(route.category)} · ${route.count} 道已核题目</small></span><span class="route-toggle" aria-hidden="true">＋</span></summary><div class="route-body"><p class="route-core">${escape(route.coreInsight)}</p><button class="button route-practice" type="button" data-route-category="${escape(route.category)}">练这一类 ${iconArrow}</button>${route.prerequisites.length?`<p class="route-prerequisites"><span>先要会</span>${route.prerequisites.map(escape).join(' · ')}</p>`:''}${Array.isArray(route.sequence)&&route.sequence.length?`<div class="route-sequence"><p>按这个顺序理清</p><ol>${route.sequence.map(part=>`<li>${escape(part)}</li>`).join('')}</ol></div>`:''}<p class="route-check"><span>练后讲回来</span>${escape(route.check)}</p><div class="route-points"><span>按检查点练</span>${route.diagnoses.map(d=>`<button type="button" data-route-category="${escape(route.category)}" data-route-diagnosis="${escape(d.type)}">${escape(d.type)} <small>${d.count}</small></button>`).join('')}</div></div></details></li>`).join('');
  }
  function scrollPanel(id){const offset=($('dd-test-banner')?.getBoundingClientRect().height||0)+12;document.documentElement.style.setProperty('--bank-scroll-offset',offset+'px');$(id).scrollIntoView({behavior:'auto',block:'start'});}
  function toggleRoute(open){
    $('routePanel').hidden=!open;$('routeButton').setAttribute('aria-expanded',String(open));
    if(open){preserveDraft();renderRoutes();$('catalog').hidden=true;$('catalogButton').setAttribute('aria-expanded','false');$('questionPanel').hidden=true;$('repairPanel').hidden=true;$('emptyPanel').hidden=true;}
    else setView(currentView);
    for(const selector of ['.bottom-row','.filter-row','.daily-note','.finish-row'])document.querySelector(selector).hidden=open;if(open)scrollPanel('routePanel');
  }
  function routePractice(categoryValue,diagnosisValue){
    category=categoryValue;diagnosis=diagnosisValue||'all';filter='all';search='';$('searchInput').value='';syncTabs();toggleRoute(false);firstQuestion();scrollPanel('questionPanel');
  }
  function renderSource(q){
    $('sourceLabel').textContent=q.source?.material||q.source?.label||'材料名称待核';
    $('sourceDetail').innerHTML='<dl class="source-grid">'+sourceRows(q).map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')+'</dl><p class="source-boundary">这里只展示脱敏来源位置；原始作答和批改记录保留在私有档案。</p>';
    $('sourceDetail').hidden=true;$('sourceButton').setAttribute('aria-expanded','false');
  }
  function renderMethod(q){
    const t=q.teaching||{},d=q.diagnosis||{},r=t.reference||{};
    $('methodDetails').open=false;
    $('methodContent').innerHTML=[['这题的目标',t.goal],['用到的方法',t.focus],['先要会什么',Array.isArray(t.prerequisites)?t.prerequisites.join(' · '):''],['换一道怎样用',t.transferPrompt],['方法依据',[r.label,r.unit,r.pages].filter(Boolean).join(' · ')],['依据范围',r.scope],['检查点说明',d.certainty==='needs-verification'?'本题的关键检查点，具体错误原因仍待实际过程核实。':/[\u3400-\u9fff]/.test(d.certainty||'')?d.certainty:'这里整理的是本题需要核查的步骤，不表示当前已经掌握。']].filter(row=>row[1]).map(([label,value])=>`<p><strong>${escape(label)}</strong>${escape(value)}</p>`).join('');
    const transferCheck=Array.isArray(t.transferCheck)?t.transferCheck.join('\n'):text(t.transferCheck);if(t.transferPrompt&&transferCheck)$('methodContent').innerHTML+=`<details class="transfer-check"><summary>做完再看迁移核对</summary><div>${escape(transferCheck)}</div><p class="transfer-note">新编迁移，用口述或纸笔完成；不计入历史错题，也不自动记为掌握。</p></details>`;
    $('methodDetails').hidden=!$('methodContent').textContent;
    $('repairKicker').textContent=d.type?'先检查这里 · '+d.type:'只理清当前这一步';
    $('repairGap').textContent=d.breakpoint||'从关键的一步开始。';$('repairReason').textContent=d.reason||q.hint||'先辨清数量关系，再计算。';$('repairCheck').textContent=d.check||'看完遮住方法，再回原题试一次。';
    $('recallPrompt').textContent=t.recallPrompt||'刚才为什么可以这样变？';
  }
  function renderTransfer(q){
    const t=q.teaching||{},answer=Array.isArray(t.transferCheck)?t.transferCheck.join('\n'):text(t.transferCheck);
    $('transferText').textContent=t.transferPrompt||'把方法带到另一道题，再试一次。';$('transferCheckDetails').open=false;$('transferCheckDetails').hidden=!(t.transferPrompt&&answer);$('transferCheckAnswer').textContent=answer;$('transferNote').hidden=!t.transferPrompt;
  }
  function openDiagram(src,alt,caption){
    const safe=safeAsset(src);if(!safe)return;
    $('zoomImage').src=safe;$('zoomImage').alt=alt||'数学图解';$('zoomCaption').textContent=caption||'';
    $('diagramDialog').classList.remove('is-enlarged');$('zoomToggle').textContent='放大细节';$('zoomToggle').setAttribute('aria-pressed','false');$('zoomHint').textContent='当前显示全图';$('diagramDialog').showModal();
  }
  function pending(){return state.attempts.filter(a=>!state.queuedIds.includes(a.id));}
  function summary(){const p=items.map(q=>getProgress(q.id));return {new:p.filter(x=>x.key==='new').length,review:p.filter(x=>x.key==='review'||x.key==='once').length,mastered:p.filter(x=>x.key==='mastered').length};}
  function renderCounts(){const s=summary();$('totalCount').textContent=items.length;$('questionTotal').textContent=items.length;$('finishCount').textContent=pending().length?`本次还有 ${pending().length} 条作答待收尾`:'做完可以随时收尾';$('summaryNew').textContent=s.new;$('summaryReview').textContent=s.review;$('summaryMastered').textContent=s.mastered;$('syncButton').textContent=test?'结束本次测试':'完成并同步';}
  function renderList(){
    const list=filtered();$('catalogCount').textContent=`${list.length} 题`;
    $('questionList').innerHTML=list.length?list.map((q,i)=>`<li><button type="button" data-question="${escape(q.id)}"><span class="q-index">${String(i+1).padStart(2,'0')}</span><span><span class="list-title">${escape(q.title||q.prompt)}</span><span class="list-meta">${escape(q.category)} · ${escape(q.diagnosis?.type||recordLabel(q))}${isImportant(q)?' · 重点':''}</span></span><span class="list-state">${escape(getProgress(q.id).label)}</span></button></li>`).join(''):'<li class="empty-state">这个分类暂时没有题目。试试“全部题目”。</li>';
  }
  function renderParent(){
    renderCounts();const coverage=bank.coverage||{};
    $('coverageText').textContent=((bank.checkedAt||bank.asOf)?'题库核查日期：'+(bank.checkedAt||bank.asOf)+'。':'')+(coverage.publicSummary||bank.coverageSummary||coverage.scope||coverage.note||'范围：本学期开学以来已收录、题面和答案可核对的数学题。已排除改判正确、不能定位原题的条目。');
    const gaps=bank.pendingItems||coverage.pendingItems||bank.items.filter(q=>q.status==='needs-source');$('pendingSourceCount').textContent=gaps.length;$('pendingSourceList').innerHTML=gaps.length?gaps.map(q=>`<li><strong>${escape(q.title||q.category||'待核对题目')}</strong>：${escape(q.gap||q.missing||q.note||q.prompt||'原题条件不全，暂不进入练习。')}</li>`).join(''):'<li>当前没有待核对题面。</li>';$('parentPolicy').textContent='记录只属于当前孩子。提示或参考后做对仍进“待复查”；首次独立正确记“再验一次”，不同日期连续独立通过后才记“跨日通过”。原历史保留。';
    $('historyList').innerHTML=state.attempts.slice(-30).reverse().map(a=>{const q=items.find(x=>x.id===a.questionId);return `<li>${escape(dayKey(a.at))} · ${escape(q?.title||a.questionId)}：${escape(a.correct?(a.independent?'独立做对':'订正后做对'):a.manual?'待人工复看':'待复查')}</li>`;}).join('')||'<li>还没有本机练习记录。</li>';
  }
  function hideFeedback(){ $('feedback').hidden=true;$('hintBox').hidden=true;$('referenceBox').hidden=true;$('transferPanel').hidden=true; }
  function setView(view){currentView=view;$('routePanel').hidden=true;$('routeButton').setAttribute('aria-expanded','false');for(const selector of ['.bottom-row','.filter-row','.daily-note','.finish-row'])document.querySelector(selector).hidden=false;$('questionPanel').hidden=view!=='question';$('repairPanel').hidden=view!=='repair';$('emptyPanel').hidden=view!=='empty';}
  function questionPosition(){const qs=filtered(),n=qs.findIndex(x=>x.id===current?.id);$('position').textContent=n<0?'本题':`${n+1} / ${qs.length}`;}
  function openQuestion(id,returning=false){
    const q=items.find(x=>x.id===id);if(!q)return;
    current=q;state.currentId=q.id;let draft=state.drafts[q.id]||{};if(draft.day!==dayKey()){draft={};delete state.drafts[q.id];}
    assisted=Boolean(draft.assisted)||state.helpDays[q.id]===dayKey();referenceSeen=Boolean(draft.referenceSeen);blocking=Number(draft.blocking)||0;checked=Boolean(draft.completed);step=0;
    $('categoryLabel').textContent=q.category||'数学';$('importantLabel').hidden=!isImportant(q);questionPosition();
    $('questionIntro').textContent=recordLabel(q)+' · '+(q.source?.kind==='transfer'?'方法变式 · 新编练习':q.source?.kind==='reconstructed'?'根据已核记录还原的练习':'原题重练')+' · 先自己做，卡住再看提示';
    $('questionText').textContent=q.prompt;const safeImage=safeAsset(q.image);$('questionDiagram').hidden=!safeImage;if(safeImage){$('diagramImage').src=safeImage;$('diagramImage').alt=q.diagramAlt||q.visual?.alt||'题目条件图';$('diagramCaption').textContent=q.diagramCaption||(q.visual?.kind==='question'?q.visual.caption:'')||'题目条件图';}$('questionText').classList.toggle('formula',q.prompt.length<40&&!/[一-龥]{8}/.test(q.prompt));
    $('answerInput').value=draft.answer||'';$('openAnswer').value=draft.answer||'';$('answerInput').disabled=false;$('openAnswer').disabled=false;
    const isOpen=['manual','open'].includes(q.kind)||['过程复查','process-gap'].includes(q.recordType);$('numberAnswer').hidden=isOpen||q.kind==='choice';$('openAnswerGroup').hidden=!isOpen;$('choiceAnswer').hidden=q.kind!=='choice';
    $('answerInput').inputMode=(q.kind==='number'&&q.answerFormat!=='expression-result'&&!(q.answers||[]).some(a=>/[^\d.+-]/.test(a)))?'decimal':'text';$('answerInput').placeholder=q.placeholder||'在这里写答案';$('answerUnit').textContent=q.unit||'';
    $('choiceAnswer').innerHTML=q.kind==='choice'?(q.options||[]).map(o=>{const value=typeof o==='object'?o.value:o,label=typeof o==='object'?o.label:o;return `<button class="option${draft.answer===value?' selected':''}" type="button" data-choice="${escape(value)}" aria-pressed="${draft.answer===value}">${escape(label)}</button>`;}).join(''):'';
    $('checkButton').disabled=false;$('checkButton').innerHTML='检查答案 '+iconArrow;$('hintButton').disabled=false;$('hintButton').textContent='给我一点提示';$('hintButton').onclick=showHint;$('nextButton').textContent='下一题';
    renderSource(q);renderTransfer(q);
    hideFeedback();setView('question');$('feedbackAction').onclick=()=>openRepair('wrong');if(checked){const last=attemptsFor(q.id).at(-1),ok=last?.correct===true;$('checkButton').disabled=true;$('answerInput').disabled=true;$('openAnswer').disabled=true;$('feedback').hidden=false;$('feedback').className=ok?'feedback':'feedback wrong';$('feedbackTitle').textContent=ok?'今天这次作答已保留':'这道题还需要复查';$('feedbackText').textContent=ok?'保留方法，换一天再独立复验。':'上次的提示和作答都在，可以遮住后再试。';$('feedbackAction').hidden=false;$('feedbackAction').textContent='遮住旧答案，再试一次';$('feedbackAction').onclick=()=>{$('answerInput').value='';$('openAnswer').value='';retry();preserveDraft();};}$('catalog').hidden=true;$('catalogButton').setAttribute('aria-expanded','false');save();renderCounts();renderList();
    if(returning){$('hintBox').hidden=false;$('hintText').textContent='回到刚才这题。保留思路，重新写一次。';}
  }
  function firstQuestion(){const list=filtered();if(!list.length){setView('empty');$('emptyTitle').textContent=filter==='review'?'当前没有待复查题':'这个分类还没有题目';$('emptyText').textContent='可以切回全部题目，继续选择。';return;}openQuestion(list.find(q=>getProgress(q.id).key==='review')?.id||list.find(q=>getProgress(q.id).key==='new')?.id||list[0].id);}
  function answerValue(){if(current.kind==='choice')return state.drafts[current.id]?.answer||'';return (['manual','open'].includes(current.kind)||['过程复查','process-gap'].includes(current.recordType))?$('openAnswer').value:$('answerInput').value;}
  function preserveDraft(){if(!current)return;state.drafts[current.id]={answer:answerValue(),assisted,referenceSeen,blocking,completed:checked,day:dayKey()};save();}
  function markHelp(){assisted=true;state.helpDays[current.id]=dayKey();preserveDraft();}
  function showHint(){markHelp();$('hintBox').hidden=false;$('hintText').textContent=current.hint||'先圈出已知量，再想清楚这一步要求什么。';$('hintButton').textContent='看一步方法';$('hintButton').onclick=()=>openRepair('hint');}
  function record(result,manual=false){
    const a={id:uid(),mode:test?'test':'formal',questionId:current.id,at:new Date().toISOString(),answer:answerValue(),correct:manual?null:result.correct===true,independent:result.correct===true&&!current.processRequired&&!assisted&&!referenceSeen&&blocking===0,hintUsed:assisted,referenceSeen,manual,formatOnly:Boolean(result.formatOnly)};
    state.attempts.push(a);preserveDraft();renderCounts();return a;
  }
  function submit(){
    if(!current||checked)return;const result=judge(current,answerValue());
    if(result.empty){$('feedback').hidden=false;$('feedback').className='feedback wrong';$('feedbackTitle').textContent='先写下你的答案';$('feedbackText').textContent='不会也可以先看一条提示。';$('feedbackAction').hidden=true;return;}
    if(result.manual){checked=true;record({correct:null},true);revealReference('这题需要对照关键步骤核查。');return;}
    record(result);
    if(result.correct){checked=true;$('checkButton').disabled=true;$('answerInput').disabled=true;$('openAnswer').disabled=true;$('feedback').hidden=false;$('feedback').className='feedback';$('feedbackTitle').textContent=current.processRequired?'数值核对上了，过程还要复查':assisted||referenceSeen||blocking?'这次订正对了':'这次自己做对了';$('feedbackText').textContent=current.processRequired?'请在纸上保留竖式或简便计算过程，和完整解法逐步核对。这次数值对不代表过程已通过。':assisted||referenceSeen||blocking?'下次遮住提示，再独立验一次。':'保留方法，下次换一天再验。';$('feedbackAction').hidden=true;$('transferPanel').hidden=false;renderTransfer(current);$('nextButton').textContent='继续下一题';preserveDraft();return;}
    blocking+=1;markHelp();
    if(blocking>=2){revealReference(result.message||'对照答案找差别，再决定重试或继续。');return;}
    $('feedback').hidden=false;$('feedback').className='feedback wrong';$('feedbackTitle').textContent=result.formatOnly?'数值对，写法还差一步':'先检查一个关键步骤';$('feedbackText').textContent=result.message||current.hint||'先看清数量关系，再检查计算。';$('feedbackAction').hidden=false;$('feedbackAction').textContent='看方法，再回这题';
  }
  function openRepair(reason){
    markHelp();setView('repair');$('modelStage').hidden=false;$('repairTitle').textContent='把这一步理清';renderMethod(current);$('repairDiagnosis').hidden=false;$('repairFigures').innerHTML=figureMarkup(current,true);$('recallBox').hidden=true;$('recallButton').textContent='遮住方法，讲回来';step=0;modelSpec=selectModel(current);modelValue=modelSpec?.value;modelDisplay='figure';renderModel();scrollPanel('repairPanel');
  }
  function renderQuantityModel(){
    const hasFigures=Boolean($('repairFigures').children.length);$('modelContent').classList.toggle('has-graphic',hasFigures||Boolean(modelSpec));$('modelGraphicTabs').hidden=!(modelSpec&&hasFigures);$('repairFigures').hidden=Boolean(modelSpec&&modelDisplay==='interactive');$('quantityModel').hidden=!modelSpec||(hasFigures&&modelDisplay==='figure');$('modelGraphicTabs').querySelectorAll('[data-model-display]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modelDisplay===modelDisplay)));if(!modelSpec)return;
    const fmt=n=>Number(n.toPrecision(12)).toString();
    if(modelSpec.type==='split'){
      const {a,b,sign}=modelSpec,c=modelValue;
      const total=sign==='+'?b+c:b-c,den=Math.max(sign==='+'?b+c:b,1),w=300;
      const left=w*(sign==='+'?b:Math.max(0,b-c))/den,right=w*c/den;
      $('quantityTitle').textContent='改变一部分，看总量怎么变';
      $('quantityGraphic').innerHTML=`<svg class="quantity-svg" viewBox="0 0 340 130" role="img" aria-label="${escape(a+'×('+b+sign+c+')')} 的数量条"><text x="20" y="19" class="quantity-label">每份 ${a}，${sign==='+'?'合并':'原来'} ${b} ${sign==='+'?'＋':'份，去掉'} ${c} 份</text><rect x="20" y="37" width="${left}" height="34" rx="5" fill="var(--identity)"/><rect x="${20+left}" y="37" width="${right}" height="34" rx="5" fill="${sign==='+'?'#d5a64c':'#efd3c8'}"/>${sign==='-'?`<path d="M${20+left+3} 66L${20+left+Math.max(right-3,3)} 42" stroke="#a74722" stroke-width="2"/>`:''}<text x="20" y="94" class="quantity-label">${a} × ${b} = ${fmt(a*b)}</text><text x="20" y="119" class="quantity-label">${sign==='+'?'加上':'减去'} ${a} × ${c} = ${fmt(a*c)}</text></svg>`;
      $('quantityEquation').textContent=`${a} × (${b} ${sign==='+'?'＋':'－'} ${c}) = ${fmt(a*total)}`;
      $('quantityControls').innerHTML='<button type="button" class="button" data-model-value="-1">第二部分 −1</button><button type="button" class="button" data-model-value="1">第二部分 ＋1</button><button type="button" class="button" data-model-value="reset">还原</button>';
      $('quantityNote').textContent=sign==='+'?'两部分都要乘同一个数，再把结果加起来。':'两部分都乘同一个数，再求它们相差多少。';
    }else{
      const p=modelValue,r=rational(modelSpec.raw),value=Number(r.n)/Number(r.d),scale=10**p,lo=Math.floor(value*scale)/scale,hi=lo+1/scale,ratio=Math.max(0,Math.min(1,(value-lo)/(hi-lo)));
      $('quantityTitle').textContent='保留哪一位，就看它后面一位';
      $('quantityGraphic').innerHTML=`<svg class="quantity-svg" viewBox="0 0 340 120" role="img" aria-label="原数在相邻两个${p===1?'一位':p===2?'两位':'三位'}小数之间的位置"><path d="M30 65H310" stroke="#b5c1c8" stroke-width="3"/><path d="M30 56v18M170 56v18M310 56v18" stroke="#80929d" stroke-width="2"/><text x="30" y="98" text-anchor="middle" class="quantity-label">${lo.toFixed(p)}</text><text x="310" y="98" text-anchor="middle" class="quantity-label">${hi.toFixed(p)}</text><text x="170" y="115" text-anchor="middle" class="quantity-label">中点</text><circle cx="${30+280*ratio}" cy="65" r="7" fill="var(--accent)"/><text x="170" y="26" text-anchor="middle" class="quantity-label">原数约 ${value.toFixed(Math.min(p+3,6))}</text></svg>`;
      $('quantityEquation').textContent=`${modelSpec.expression} ≈ ${roundDecimal(modelSpec.raw,p)}`;
      $('quantityControls').innerHTML=[1,2,3].map(v=>`<button type="button" class="button${p===v?' active-model':''}" data-model-value="${v}" aria-pressed="${p===v}">保留${v}位</button>`).join('');
      $('quantityNote').textContent='靠近哪一端就取哪一端；在中点时向较大的数进一。末尾的0也表示精确到哪一位。';
    }
  }
  function renderModel(){
    renderQuantityModel();
    const steps=current.steps?.length?current.steps:[current.explanation||current.hint||'先辨清数量关系，再计算。'];
    const shown=step===0?current.prompt:steps[Math.min(step-1,steps.length-1)];
    $('modelEquation').textContent=shown;$('modelEquation').classList.toggle('model-prompt',step===0);$('modelProgress').style.width=`${step/steps.length*100}%`;$('modelSteps').textContent=step===0?'先想：下一步会变成什么？':`第 ${step} 步，共 ${steps.length} 步`;$('modelNext').textContent=step<steps.length?'展开下一步':'再看一遍';$('modelReset').disabled=step===0;
    if(step>0){referenceSeen=true;markHelp();}
  }
  function revealReference(message){
    referenceSeen=true;checked=true;$('checkButton').disabled=true;$('answerInput').disabled=true;$('openAnswer').disabled=true;markHelp();setView('question');$('referenceBox').hidden=false;$('referenceMessage').textContent=message||'对照答案和步骤，找到需要改的地方。';$('referenceAnswer').textContent=current.referenceAnswer||(current.answers||[]).join(' 或 ')||current.explanation||'请对照已核实的题目关系复看。';
    $('referenceFigures').innerHTML=figureMarkup(current);$('referenceSteps').innerHTML=(current.steps||[]).map(s=>`<li>${escape(s)}</li>`).join('');$('referenceExplanation').textContent=current.explanation||'';const refImg=current.referenceImage;const validRef=typeof refImg==='string'&&/^(?:\.\.\/)?assets\/[a-zA-Z0-9_./-]+\.(?:svg|png|webp|jpg)$/.test(refImg);$('referenceDiagram').hidden=!validRef;if(validRef){$('referenceDiagram').src=refImg.startsWith('assets/')?'../'+refImg:refImg;$('referenceDiagram').alt='参考作图，仅供作答后核查';}$('referenceChecks').innerHTML=(current.expectedChecks||[]).map(x=>`<li>${escape(x)}</li>`).join('');$('feedback').hidden=true;preserveDraft();
  }
  function retry(){checked=false;$('answerInput').disabled=false;$('openAnswer').disabled=false;$('checkButton').disabled=false;$('referenceBox').hidden=true;$('feedback').hidden=true;$('hintBox').hidden=false;$('hintText').textContent='遮住参考答案，再按刚才的方法自己算。';setView('question');}
  function nextQuestion(){const list=filtered();if(!list.length){firstQuestion();return;}const index=list.findIndex(x=>x.id===current?.id);openQuestion(list[(index+1)%list.length].id);}
  function transfer(){const list=items.filter(q=>q.id!==current.id&&q.category===current.category);if(list.length){const q=list.find(q=>getProgress(q.id).key==='new')||list[0];filter='all';category='all';diagnosis='all';search='';$('searchInput').value='';syncTabs();openQuestion(q.id);$('questionIntro').textContent='同类原题再练 · 试着自己用出方法';}else{$('transferText').textContent='本类已核原题暂时只有这一题。先讲清为什么这样算，下次再独立复查。';}}
  function syncTabs(){document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.filter===filter)));$('categorySelect').value=category;$('diagnosisSelect').value=diagnosis;renderList();}
  function exportData(format){
    save();let content,type,name;
    if(format==='json'){content=rawRecovery||JSON.stringify(state,null,2);type='application/json';name=`${child}-math-mistakes-${dayKey()}.json`;}
    else{const s=summary();content=`# ${child==='kenton'?'Kenton':'Eddey'} 数学错题练习记录\n\n导出日期：${dayKey()}\n\n待练 ${s.new} · 待复查 ${s.review} · 跨日通过 ${s.mastered}\n\n`+items.map(q=>`## ${q.title||q.prompt}\n\n${q.prompt}\n\n${sourceRows(q).map(([label,value])=>label+'：'+value).join('\n')}\n\n关键检查点：${q.diagnosis?.breakpoint||q.hint||'待核'}\n原因：${q.diagnosis?.reason||''}\n自查：${q.diagnosis?.check||''}\n\n状态：${getProgress(q.id).label}\n\n`+attemptsFor(q.id).map(a=>`- ${dayKey(a.at)}：${a.answer||'未填写'}；${a.correct?(a.independent?'独立正确':'提示/参考后正确'):'待复查'}\n`).join('')).join('\n');type='text/markdown';name=`${child}-math-mistakes-${dayKey()}.md`;}
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importData(file){try{if(!file||file.size>5000000)throw new Error('请选择小于5MB的练习记录JSON。');const imported=validImport(JSON.parse(await file.text()),child,appId,items.map(q=>q.id),test?'test':'formal');const ids=new Set(state.attempts.map(a=>a.id));for(const a of imported.attempts)if(!ids.has(a.id)){state.attempts.push(a);ids.add(a.id);}state.attempts.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));state.seconds=Math.max(state.seconds,Number(imported.seconds)||0);save();renderParent();renderList();$('parentMessage').textContent='已合并导入；重复记录已跳过。';}catch(error){$('parentMessage').textContent=error.message||'文件无法读取，原记录没有改动。';}}
  async function finish(){
    save();if(test||!root.DDLearningSync||root.DDLearningSync.isTest()){ $('syncMessage').textContent='测试记录已留在本机测试区，没有上传。';return; }
    const rows=pending();if(!rows.length){$('syncMessage').textContent='当前没有新的作答需要同步。';return;}
    $('syncButton').disabled=true;
    try{
      for(const a of rows){const q=items.find(x=>x.id===a.questionId);const accepted=root.DDLearningSync.recordAttempt({client_event_id:`${appId}-${child}-${a.id}`,ts:a.at,kid:child,subject:'数学',activity:'math_mistake_retry',topic:q.category,item:q.prompt,ok:a.correct,hint:a.referenceSeen?'reference':a.hintUsed?'hint':'none',source:location.pathname.replace(/^\//,''),payload:{schema:SCHEMA,version:VERSION,appId,questionId:a.questionId,answer:a.manual?'[本机保留开放回答]':a.answer,independent:a.independent,referenceSeen:a.referenceSeen,hintUsed:a.hintUsed,reviewNeeded:!a.independent,formatOnly:a.formatOnly}});if(accepted)state.queuedIds.push(a.id);}
      const completed=root.DDLearningSync.complete({client_event_id:`${appId}-${child}-complete-${rows[rows.length-1].id}`,kid:child,subject:'数学',topic:'数学错题库',item:`完成本次 ${rows.length} 条数学练习`,payload:{appId,attemptCount:rows.length,independentCount:rows.filter(a=>a.independent).length,seconds:Math.round(state.seconds)}});save();
      if(!completed){$('syncMessage').textContent='记录已在本机保留，当前未能确认同步。';return;}
      const result=await root.DDLearningSync.flush();$('syncMessage').textContent=result&&result.ok&&!result.queued?'本次作答已同步。':'本次已加入同步队列，联网后会继续同步。';renderCounts();
    }catch(_){$('syncMessage').textContent='本机记录保留。同步暂未完成，可稍后重试。';}finally{$('syncButton').disabled=false;}
  }
  function connect(){
    $('answerForm').onsubmit=e=>{e.preventDefault();submit();};
    $('hintButton').onclick=showHint;$('feedbackAction').onclick=()=>openRepair('wrong');$('nextButton').onclick=nextQuestion;$('previousButton').onclick=()=>{const list=filtered(),i=list.findIndex(q=>q.id===current?.id);if(list.length)openQuestion(list[(i-1+list.length)%list.length].id);};
    $('answerInput').oninput=preserveDraft;$('openAnswer').oninput=preserveDraft;
    $('choiceAnswer').onclick=e=>{const b=e.target.closest('[data-choice]');if(!b||checked)return;state.drafts[current.id]={...(state.drafts[current.id]||{}),answer:b.dataset.choice};$('choiceAnswer').querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});preserveDraft();};
    $('catalogButton').onclick=()=>{if(!$('routePanel').hidden)toggleRoute(false);const open=$('catalog').hidden;$('catalog').hidden=!open;$('catalogButton').setAttribute('aria-expanded',String(open));renderList();};$('closeCatalog').onclick=()=>{$('catalog').hidden=true;$('catalogButton').setAttribute('aria-expanded','false');};
    $('questionList').onclick=e=>{const b=e.target.closest('[data-question]');if(b)openQuestion(b.dataset.question);};
    document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;syncTabs();firstQuestion();});
    $('categorySelect').onchange=e=>{category=e.target.value;diagnosis='all';$('diagnosisSelect').value='all';renderList();};$('searchInput').oninput=e=>{search=e.target.value.trim();renderList();};
    $('sourceButton').onclick=()=>{const open=$('sourceDetail').hidden;$('sourceDetail').hidden=!open;$('sourceButton').setAttribute('aria-expanded',String(open));};
    $('routeButton').onclick=()=>toggleRoute($('routePanel').hidden);$('closeRoute').onclick=()=>toggleRoute(false);$('routeList').onclick=e=>{const b=e.target.closest('[data-route-category]');if(b)routePractice(b.dataset.routeCategory,b.dataset.routeDiagnosis);};
    $('diagnosisSelect').onchange=e=>{diagnosis=e.target.value;renderList();};
    $('diagramZoom').onclick=()=>openDiagram(current.image,$('diagramImage').alt,$('diagramCaption').textContent);
    for(const id of ['repairFigures','referenceFigures'])$(id).onclick=e=>{const b=e.target.closest('[data-zoom-src]');if(b)openDiagram(b.dataset.zoomSrc,b.dataset.zoomAlt,b.dataset.zoomCaption);const page=e.target.closest('[data-figure-page]');if(page){$(id).querySelectorAll('[data-figure-index]').forEach(f=>f.hidden=f.dataset.figureIndex!==page.dataset.figurePage);$(id).querySelectorAll('[data-figure-page]').forEach(p=>p.setAttribute('aria-pressed',String(p===page)));}};
    $('modelGraphicTabs').onclick=e=>{const b=e.target.closest('[data-model-display]');if(b){modelDisplay=b.dataset.modelDisplay;renderQuantityModel();}};
    $('zoomToggle').onclick=()=>{const enlarged=$('diagramDialog').classList.toggle('is-enlarged');$('zoomToggle').textContent=enlarged?'看全图':'放大细节';$('zoomToggle').setAttribute('aria-pressed',String(enlarged));$('zoomHint').textContent=enlarged?'左右滑动，查看图的各处':'当前显示全图';document.querySelector('.zoom-scroll').scrollLeft=0;};
    $('closeDiagram').onclick=()=>$('diagramDialog').close();$('diagramDialog').onclick=e=>{if(e.target===$('diagramDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
    $('quantityControls').onclick=e=>{const b=e.target.closest('[data-model-value]');if(!b||!modelSpec)return;const v=b.dataset.modelValue;if(modelSpec.type==='round')modelValue=Number(v);else modelValue=v==='reset'?modelSpec.value:Math.max(0,Math.min(modelSpec.sign==='-'?modelSpec.b:1e6,modelValue+Number(v)));renderQuantityModel();};
    $('modelNext').onclick=()=>{const n=current.steps?.length||1;step=step<n?step+1:0;renderModel();};$('modelReset').onclick=()=>{step=0;renderModel();};
    $('recallButton').onclick=()=>{const open=$('recallBox').hidden;$('recallBox').hidden=!open;$('modelStage').hidden=open;$('repairDiagnosis').hidden=open;$('methodDetails').hidden=open||!$('methodContent').textContent;$('recallButton').textContent=open?'再看方法':'遮住方法，讲回来';scrollPanel('repairPanel');};
    $('returnButton').onclick=()=>{$('modelStage').hidden=false;openQuestion(current.id,true);};$('showReference').onclick=()=>revealReference();$('retryButton').onclick=retry;
    $('continueButton').onclick=()=>{preserveDraft();nextQuestion();};$('transferButton').onclick=transfer;
    $('parentButton').onclick=()=>{$('parentPanel').hidden=!$('parentPanel').hidden;renderParent();if(!$('parentPanel').hidden)$('parentPanel').scrollIntoView({behavior:'smooth',block:'start'});};
    $('closeParent').onclick=()=>{$('parentPanel').hidden=true;};$('exportJSON').onclick=()=>exportData('json');$('exportMD').onclick=()=>exportData('md');$('importButton').onclick=()=>$('importFile').click();$('importFile').onchange=e=>importData(e.target.files[0]);$('syncButton').onclick=finish;
    $('emptyAll').onclick=()=>{filter='all';category='all';diagnosis='all';search='';$('searchInput').value='';syncTabs();firstQuestion();};$('retryLoad').onclick=()=>location.reload();
    document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else activeStart=Date.now();});root.addEventListener('pagehide',save);
  }
  async function boot(){
    connect();if(test)$('testPill').hidden=false;
    try{
      const response=await fetch(config.dataUrl,{cache:'no-store'});if(!response.ok)throw new Error('题库暂时没有加载成功。');bank=await response.json();if(bank.child!==child||!Array.isArray(bank.items))throw new Error('题库归属校验未通过。');
      items=bank.items.filter(q=>q.status!=='needs-source'&&q.status!=='excluded'&&q.prompt&&q.id);if(new Set(items.map(q=>q.id)).size!==items.length)throw new Error('题号出现重复，需要核对后再练。');
      try{rawRecovery=localStorage.getItem(key);const stored=JSON.parse(rawRecovery);if(stored){validImport(stored,child,appId,[...items.map(q=>q.id),...(stored.attempts||[]).map(a=>a.questionId)],test?'test':'formal');state={...state,...stored,drafts:stored.drafts||{},helpDays:stored.helpDays||{},queuedIds:Array.isArray(stored.queuedIds)?stored.queuedIds:[]};}rawRecovery=null;}catch(_){storageLocked=true;$('saveLabel').textContent='旧记录待恢复，当前作答暂存；请导出备份';$('parentMessage').textContent='旧记录未被覆盖。导出备份会保留旧文件原文，可交给家长恢复。';}
      $('categorySelect').innerHTML='<option value="all">全部分类</option>'+[...new Set(items.map(q=>q.category))].map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');
      $('diagnosisSelect').innerHTML='<option value="all">全部检查点</option>'+[...new Set(items.map(q=>q.diagnosis?.type).filter(Boolean))].map(d=>`<option value="${escape(d)}">${escape(d)}</option>`).join('');
      const dailySurpriseKey=appId+'|'+child+'|'+dayKey();const DAILY_SURPRISES=['先看清数量关系，再动笔计算。','写完回头看：这个答案大致合理吗？','把方法讲清楚，比记住一个答案更有用。','保留正确的步骤，只修需要改变的那一步。'];let hash=0;for(const c of dailySurpriseKey)hash=(hash*31+c.charCodeAt(0))>>>0;$('dailyText').textContent=DAILY_SURPRISES[hash%DAILY_SURPRISES.length];
      $('loadingPanel').hidden=true;$('workArea').hidden=false;renderCounts();renderList();const requested=query.get('q');const id=items.find(q=>q.id===requested)?.id||items.find(q=>q.id===state.currentId)?.id||items.find(q=>isImportant(q)&&['错题','confirmed-error'].includes(q.recordType)&&getProgress(q.id).key==='new')?.id||items[0]?.id;if(id)openQuestion(id);else firstQuestion();
    }catch(error){$('loadingText').textContent=error.message||'题库暂时无法读取。点击重试。';$('retryLoad').hidden=false;}
  }
  boot();
})(typeof window==='undefined'?globalThis:window);
