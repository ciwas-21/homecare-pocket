// 機構部署時，可將此變數替換成督導電話，例如 '0912345678'。
const SUPERVISOR_PHONE_NUMBER = '';
// 未設定督導電話時，預設撥打機構總機；另一支總機可改為 '0229226100'。
const AGENCY_PHONE_NUMBER = '0286605972';
const $ = s => document.querySelector(s);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let savedPhone='';try{savedPhone=localStorage.getItem('supervisorPhone')||''}catch{}
const categories=window.GUIDE;
const categoryIcons=['🫀','🩹','🚪','🛡️','🛵','🏠'];
const eventIcons=[['😵','💔','🤢','〰️','🗣️','🤕','🫁'],['🚶','😮','🩸','♨️','💊','🧷'],['🚪','🔒'],['✋','🛡️','💰'],['🛵','🦽'],['🔥','🍳','🔌','🫨','⚠️']];
function actionKey(text){
 if(/撥打119|撥打110|立即撥打/.test(text))return '📞';
 if(/加壓|止血|包紮/.test(text))return '🩹';
 if(/沖洗/.test(text))return '🚿';
 if(/給藥|藥袋|餵藥/.test(text))return '💊';
 if(/關閉.*電源/.test(text))return '🔌';
 if(/鍋蓋|爐火/.test(text))return '🍳';
 if(/窗戶通風/.test(text))return '🪟';
 if(/離開|逃生|安全出口/.test(text))return '🚪';
 if(/照片|拍照|紀錄|記錄/.test(text))return '📝';
 if(/查看|確認|觀察/.test(text))return '👀';
 if(/通報|回報|聯絡/.test(text))return '📣';
 if(/側躺|休息/.test(text))return '🛏️';
 if(/頭頸|頭部|掩護/.test(text))return '🛡️';
 return '🤝';
}
function actionIcon(text){return illustratedIcon(actionKey(text));}
const categoryDescriptions=['意識、胸痛、嘔吐/腹瀉、頭痛、身體狀況異常','跌倒、噎到、流血、燙傷、藥物、管路滑落','找不到個案或無人回應時','自身安全受到影響時','行車或陪同外出遇到事故時','周遭環境出現危險時'];
function updatePhone(){const p=savedPhone||SUPERVISOR_PHONE_NUMBER||AGENCY_PHONE_NUMBER;$('#supervisor').href=p?'tel:'+p:'#';$('#supervisorHint').textContent=(savedPhone||SUPERVISOR_PHONE_NUMBER)?'服務通報':'機構總機'}
function openSettings(){$('#phone').value=savedPhone||SUPERVISOR_PHONE_NUMBER;$('#error').textContent='';$('#dialog').showModal()}
$('#settings').onclick=openSettings;$('#close').onclick=()=>$('#dialog').close();$('#supervisor').onclick=e=>{if(!(savedPhone||SUPERVISOR_PHONE_NUMBER||AGENCY_PHONE_NUMBER)){e.preventDefault();openSettings()}};
$('#phoneForm').onsubmit=e=>{e.preventDefault();const value=$('#phone').value.replace(/[\s()-]/g,'');if(value&&!/^\+?\d{6,15}$/.test(value)){$('#error').textContent='請輸入有效的電話號碼（6～15碼數字）。';return}try{localStorage.setItem('supervisorPhone',value);savedPhone=value}catch{$('#error').textContent='無法儲存，請確認瀏覽器允許儲存設定。';return}updatePhone();$('#dialog').close()};
function card(icon,title,subtitle,href){const categoryMatch=href.match(/^#category\/(\d+)$/);const art=categoryMatch?'':`<span class="icon" aria-hidden="true">${illustratedIcon(icon)}</span>`;return `<a class="card ${categoryMatch?'category-text-card':''}" style="text-decoration:none" href="${href}">${art}<span class="cardtext"><b>${escapeHTML(title)}</b>${subtitle?`<small>${escapeHTML(subtitle)}</small>`:''}</span><span class="arrow" aria-hidden="true">›</span></a>`}
function previousPage(){const parts=location.hash.slice(1).split('/');if(parts[0]==='event'&&categories[Number(parts[1])])location.hash='category/'+parts[1];else location.hash='';}
function back(){return '<button class="back" onclick="previousPage()">← 返回上一頁</button>'}
function fitCardLabels(){
 const canvas=document.createElement('canvas');const context=canvas.getContext('2d');if(!context)return;
 document.querySelectorAll('.card b').forEach(label=>{
  const card=label.closest('.card'),text=label.parentElement,style=getComputedStyle(label);
  if(card.closest('.uniform-events')){label.style.removeProperty('font-size');label.style.removeProperty('white-space');return;}
  const width=text.clientWidth-2;if(width<=0)return;
  context.font='700 100px '+style.fontFamily;
  const measured=context.measureText(label.textContent).width;
  const availableHeight=card.clientHeight-parseFloat(getComputedStyle(card).paddingTop)-parseFloat(getComputedStyle(card).paddingBottom);
  const limit=document.body.classList.contains('category-screen')?Math.min(64,availableHeight/1.3):32;
  const fit=Math.floor(Math.min(limit,width/Math.max(measured,1)*100));
  // 長名稱保留可讀字級；一般名稱使用最大可容納的單行字級。
  label.style.fontSize=Math.max(22,fit)+'px';label.style.whiteSpace=fit>=22?'nowrap':'normal';
 });
}
window.addEventListener('resize',()=>requestAnimationFrame(fitCardLabels));
document.fonts?.ready.then(()=>requestAnimationFrame(fitCardLabels));
// 搜尋會比對所有顯示內容與隱藏白話別名；別名只提供查找，不代表診斷。
function normalizeSearch(value){return String(value).normalize('NFKC').toLocaleLowerCase().replace(/[\s，、。！？：；「」『』（）／/,.!?:;()]+/g,'');}
function findEvents(query){
 const q=normalizeSearch(query);if(!q)return [];
 const matches=[];
 categories.forEach((category,ci)=>category[2].forEach((event,ei)=>{
  const title=normalizeSearch(event[0]);
  const aliases=(event.searchAliases||[]).map(normalizeSearch);
  const situations=event[3].map(level=>level[1]);
  const actions=event[3].map(level=>level[2]);
  const visible=[category[0],event[0],event[1],event[2],...situations,...actions,...(event[4]||[])].map(normalizeSearch);
  const exactAlias=aliases.includes(q);
  const relatedAlias=aliases.some(alias=>alias.includes(q)||(alias.length>=2&&q.includes(alias)));
  if(visible.some(term=>term.includes(q))||relatedAlias){
   const situationPrefix=situations.some(text=>normalizeSearch(text).startsWith(q));
   const rank=title===q?0:exactAlias?1:title.includes(q)?2:situationPrefix?3:relatedAlias?4:5;
   matches.push({ci,ei,rank});
  }
 }));
 return matches.sort((a,b)=>a.rank-b.rank).map(({ci,ei})=>({ci,ei}));
}
function searchSummary(event,query,categoryName){
 const q=normalizeSearch(query);
 const situation=event[3].map(level=>level[1]).find(text=>normalizeSearch(text).includes(q));
 return situation||categoryName;
}
function render(){const parts=location.hash.slice(1).split('/');const c=Number(parts[1]),e=Number(parts[2]);let html='';
if(parts[0]==='event'&&categories[c]?.[2]?.[e]){const category=categories[c],item=category[2][e];html=back()+`<h1 class="event-title" tabindex="-1">${escapeHTML(item[0])}</h1><div class="description">${escapeHTML(item[1])}</div>${item[2]?`<aside class="warning"><b>⚠ 重要提醒</b>${escapeHTML(item[2])}</aside>`:''}`;
if(item[4])html+='<section class="procedure"><h2>處理步驟</h2><ol class="steps">'+item[4].map(x=>'<li><span><span class="step-symbol" aria-hidden="true">'+actionIcon(x)+'</span> '+escapeHTML(x)+'</span></li>').join('')+'</ol></section>';
html+=item[3].map(([level,situation,action])=>`<section class="level ${level}"><h2 class="situation"><span aria-hidden="true">${{r:'🔴',y:'🟡',g:'🟢'}[level]}</span> ${escapeHTML(situation)}</h2><p class="response"><span aria-hidden="true">${actionIcon(action)}</span> ${escapeHTML(action)}</p></section>`).join('');
}else if(parts[0]==='category'&&categories[c]){const category=categories[c];html=back()+`<div class="list event-grid ${[2,3,4,5].includes(c)?'vertical-events':''} ${c===0?'uniform-events':''}" style="--event-rows:${[2,3,4,5].includes(c)?category[2].length:Math.ceil(category[2].length/2)}" aria-label="${escapeHTML(category[0])}事件列表">`+category[2].map((x,i)=>card(eventIcons[c][i],x[0],'',`#event/${c}/${i}`)).join('')+'</div>';
}else{html=`<section class="hero"><strong>🚨 請立即撥打 119</strong><p>若意識不清楚，無正常呼吸或情況危急時</p><div class="notes">※ 保持冷靜，確保自身與個案安全。<br>※ 遇到異常事件，請主動通報，切勿隱瞞。</div></section><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="搜尋事件，例如：跌倒" aria-label="搜尋事件"></label><div class="sectionlabel"><h2 id="listTitle">請選擇事件分類</h2><span id="count">6 大類 · 25 個事件</span></div><div class="list" id="results">${categories.map((x,i)=>card(categoryIcons[i],x[0],categoryDescriptions[i],`#category/${i}`)).join('')}</div>`}
document.body.classList.toggle('category-screen',parts[0]==='category'&&!!categories[c]);$('.brand').hidden=(parts[0]==='event'&&!!categories[c]?.[2]?.[e])||(parts[0]==='category'&&!!categories[c]);$('#app').innerHTML='<div class="page">'+html+'<p class="footer-note">先確保安全，再依情況處理與通報。</p></div>';requestAnimationFrame(fitCardLabels);window.scrollTo({top:0,behavior:'instant'});if($('.brand').hidden)($('#app .event-title')||$('#app .back'))?.focus({preventScroll:true});const search=$('#search');if(search)search.oninput=()=>{const q=search.value.trim();if(!q){$('#results').innerHTML=categories.map((x,i)=>card(categoryIcons[i],x[0],categoryDescriptions[i],`#category/${i}`)).join('');$('#listTitle').textContent='請選擇事件分類';$('#count').textContent='6 大類 · 25 個事件';requestAnimationFrame(fitCardLabels);return}const matches=findEvents(q).map(({ci,ei})=>card(eventIcons[ci][ei],categories[ci][2][ei][0],searchSummary(categories[ci][2][ei],q,categories[ci][0]),`#event/${ci}/${ei}`));$('#listTitle').textContent='搜尋結果';$('#count').textContent=matches.length+' 個事件';$('#results').innerHTML=matches.join('')||'<div class="empty">找不到符合的事件，請換個關鍵字，或從分類查看。</div>';requestAnimationFrame(fitCardLabels)};}
window.addEventListener('hashchange',render);updatePhone();render();
