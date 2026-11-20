let S = null;
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short = (v, n=260) => { v = String(v ?? ''); return v.length > n ? v.slice(0,n)+'…' : v; };

function statusTag(s){
  const cls = s==='done'?'good':s==='running'?'warn':['blocked','crashed'].includes(s)?'bad':'';
  return `<span class="tag ${cls}">${esc(s)}</span>`;
}

function renderKPIs(){
  const c = S.board.counts, f = S.finance;
  const items = [
    ['Agents', S.agents.length, 'all online'],
    ['Tasks done', c.done||0, `${c.running||0} running · ${c.blocked||0} blocked`],
    ['Events recorded', S.board.events.length, 'live Kanban trail'],
    ['Leads verified', S.pipeline.verified_leads, `${S.pipeline.contacted} contacted`],
    ['Income (owner-confirmed)', '₹'+f.income_inr, 'UPI verification only'],
    ['Spent', '₹'+f.spent_inr, 'domain purchase'],
  ];
  $('#kpis').innerHTML = items.map(([label,val,sub]) =>
    `<div class="kpi"><b>${esc(val)}</b><span>${esc(label)}</span><div class="sub">${esc(sub)}</div></div>`).join('');
}

function agentCard(a, full){
  const ok = a.has_numes_key && a.has_cent_key;
  return `<div class="card">
    <h3>${esc(a.profile)} ${ok?'<span class="tag good">primary+fallback</span>':''}</h3>
    <div class="sub">${esc(a.model)}</div>
    <div class="kv">
      <span>Provider</span><span>${esc(a.base_url||'—')}</span>
      <span>Fallbacks</span><span>${a.fallbacks.length?a.fallbacks.map(esc).join(', '):'none'}</span>
      <span>Skills</span><span>${a.skills_count} total · ${a.role_skills.map(esc).join(', ')||'—'}</span>
      <span>Keys</span><span>${a.has_numes_key?'numes ✓':'numes ✗'} ${a.has_cent_key?'cent ✓':'cent ✗'}</span>
      <span>Log lines</span><span>${a.log.length} visible</span>
    </div>
    ${full?`<h2>Observable log</h2><pre class="log">${a.log.map(esc).join('\n')||'No filtered log lines yet.'}</pre>`:''}
  </div>`;
}

function renderAgents(){
  $('#ov-agents').innerHTML = S.agents.map(a=>agentCard(a,false)).join('');
  $('#agent-detail').innerHTML = S.agents.map(a=>agentCard(a,true)).join('');
  $('#honesty').textContent = S.honesty_note;
}

function renderFeed(el, rows, maker){
  el.innerHTML = rows.map(maker).join('') || '<div class="item"><span class="msg">No records yet.</span></div>';
}
function eventRow(e){
  let msg = e.payload || '';
  try { const p = JSON.parse(msg); msg = Object.entries(p).map(([k,v])=>`${k}: ${short(v,80)}`).join(' · '); } catch(_){}
  return `<div class="item"><span class="t">${esc(e.created_at)}</span><span class="who">${esc(e.kind)}</span><span class="msg">${esc(short(msg))}</span></div>`;
}
function commentRow(c){
  return `<div class="item"><span class="t">${esc(c.created_at)}</span><span class="who">${esc(c.author)}</span><span class="msg">${esc(short(c.body, 500))}</span></div>`;
}
function renderActivity(){
  renderFeed($('#ov-events'), S.board.events.slice(0,25), eventRow);
  renderFeed($('#all-events'), S.board.events, eventRow);
  renderFeed($('#all-comments'), S.board.comments, commentRow);
}

function fillFilters(){
  const agents = [...new Set(S.board.tasks.map(t=>t.assignee).filter(Boolean))];
  const statuses = [...new Set(S.board.tasks.map(t=>t.status).filter(Boolean))];
  $('#task-agent').innerHTML = '<option value="">All agents</option>'+agents.map(a=>`<option>${esc(a)}</option>`).join('');
  $('#task-status').innerHTML = '<option value="">All statuses</option>'+statuses.map(a=>`<option>${esc(a)}</option>`).join('');
}
function renderTasks(){
  const q = $('#task-search').value.toLowerCase(), ag = $('#task-agent').value, st = $('#task-status').value;
  const rows = S.board.tasks.filter(t =>
    (!ag||t.assignee===ag) && (!st||t.status===st) &&
    (!q || (t.title+' '+(t.body||'')+' '+(t.result||'')).toLowerCase().includes(q)));
  $('#tasks-table').innerHTML = `<table><thead><tr><th>Task</th><th>Agent</th><th>Status</th><th>Priority</th><th>Completed</th><th>Result / evidence</th></tr></thead><tbody>`+
    rows.map(t=>`<tr><td>${esc(t.title)}<div class="sub">${esc(t.id)}</div></td><td>${esc(t.assignee)}</td><td>${statusTag(t.status)}</td><td>${esc(t.priority)}</td><td>${esc(t.completed_at||'—')}</td><td class="msg">${esc(short(t.result||t.body||'',300))}</td></tr>`).join('')+
    `</tbody></table>`;
}

function renderMind(){
  $('#mindstream').innerHTML = S.agents.map(a=>{
    const comments = S.board.comments.filter(c=>c.author===a.profile).slice(0,5);
    const results = S.board.runs.filter(r=>r.profile===a.profile && r.summary).slice(0,4);
    return `<div class="card"><h3>${esc(a.profile)}</h3><div class="sub">CEO review comments &amp; delivered summaries are the visible record of reasoning.</div>
      <h2>Delivered summaries</h2><pre class="log">${results.map(r=>`[${esc(r.task_id)}] ${esc(short(r.summary,300))}`).join('\n')||'—'}</pre>
      <h2>Comments / handoffs</h2><pre class="log">${comments.map(c=>`[${esc(c.task_id)}] ${esc(short(c.body,300))}`).join('\n')||'—'}</pre>
      <h2>Live log events</h2><pre class="log">${a.log.map(esc).join('\n')||'—'}</pre></div>`;
  }).join('');
}

function renderSystems(){
  const g = S.gateway;
  $('#sys-gateway').innerHTML = `<div><b>State:</b> ${esc(g.gateway_state)}</div><div><b>Version:</b> ${esc(g.code_version)}</div><div><b>Served profiles:</b> ${esc((g.served_profiles||[]).join(', '))}</div><div><b>Updated:</b> ${esc(g.updated_at)}</div>`+
    S.cron.map(j=>`<div><b>${esc(j.name||j.id)}:</b> ${esc(j.state||'—')} · ${esc(j.last||'no run yet')}</div>`).join('');
  $('#sys-endpoints').innerHTML = Object.entries(S.systems).map(([k,v])=>`<div><b>${esc(k)}:</b> ${String(v).startsWith('200')?'<span class="tag good">200 OK</span>':esc(v)}</div>`).join('')+
    `<div><b>Pipeline:</b> ${S.pipeline.verified_leads} verified · ${S.pipeline.contacted} contacted · ${S.pipeline.replies} replies</div>`+
    `<div><b>Hot lead:</b> ${esc(S.hot_lead.name)} — ${esc(S.hot_lead.status)}</div>`;
  $('#sys-providers').innerHTML = S.agents.map(a=>`<div><b>${esc(a.profile)}:</b> ${esc(a.model)} · keys ${a.has_numes_key?'numes ✓':'numes ✗'} / ${a.has_cent_key?'cent ✓':'cent ✗'}</div>`).join('');
  const f=S.finance;
  $('#sys-finance').innerHTML = `<div><b>Income:</b> ₹${f.income_inr}</div><div><b>Spent:</b> ₹${f.spent_inr}</div><div><b>Rule:</b> ${esc(f.note)}</div>`+
    f.files.map(x=>`<div><b>${esc(x.path)}</b> · ${x.size}b · ${esc(x.modified)}</div>`).join('');
  $('#sys-files').innerHTML = `<table><thead><tr><th>Path</th><th>Size</th><th>Modified</th></tr></thead><tbody>`+
    S.business_files.map(x=>`<tr><td>${esc(x.path)}</td><td class="right">${x.size}</td><td>${esc(x.modified)}</td></tr>`).join('')+`</tbody></table>`;
}

function renderAll(){
  if(!S) return;
  $('#gen').textContent = 'Snapshot: '+S.generated_at+(S.public_mode?' · public':'');
  renderKPIs(); renderAgents(); renderActivity(); fillFilters(); renderTasks(); renderMind(); renderSystems();
}
function filterFeed(){
  const q = $('#feed-search').value.toLowerCase();
  if(!q){ renderActivity(); return; }
  const f = r => JSON.stringify(r).toLowerCase().includes(q);
  renderFeed($('#all-events'), S.board.events.filter(f), eventRow);
  renderFeed($('#all-comments'), S.board.comments.filter(f), commentRow);
}
async function load(){
  try{
    let r = await fetch('/api/snapshot?t='+Date.now());
    if(!r.ok || r.headers.get('content-type')?.includes('text/html')) throw new Error('no live API');
    S = await r.json(); renderAll();
  }catch(e){
    try{
      const r = await fetch('snapshot.json?t='+Date.now());
      S = await r.json(); renderAll();
    }catch(e2){ $('#gen').textContent = 'LOAD ERROR: '+e2.message; }
  }
}
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#tabs button').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('main section').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); $('#tab-'+b.dataset.tab).classList.add('on');
}));
$('#refresh').addEventListener('click', load);
['#task-search','#task-agent','#task-status'].forEach(s=>$(s).addEventListener('input',renderTasks));
$('#feed-search').addEventListener('input', filterFeed);
setInterval(()=>{ $('#clock').textContent = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour12:false}); }, 1000);
setInterval(load, 60000);
load();
