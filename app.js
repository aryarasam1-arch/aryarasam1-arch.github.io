'use strict';
(function(){
  var form=document.querySelector('[data-wa-form]');
  if(!form) return;
  var err=document.getElementById('form-error');
  function fail(msg){ if(err){err.hidden=false;err.textContent=msg;} }
  function clear(){ if(err){err.hidden=true;err.textContent='';} }
  form.addEventListener('submit',function(e){
    e.preventDefault(); clear();
    var data=new FormData(form);
    var name=String(data.get('name')||'').trim();
    var business=String(data.get('business')||'').trim();
    var email=String(data.get('email')||'').trim();
    var service=String(data.get('service')||'').trim();
    var message=String(data.get('message')||'').trim();
    var consent=data.get('consent');
    if(name.length<2||!business||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!service||message.length<10||!consent){
      fail('Please complete all required fields with valid details.'); return;
    }
    var text='Hello HERMES BIZ,%0A%0AName: '+encodeURIComponent(name)+'%0ABusiness: '+encodeURIComponent(business)+'%0AEmail: '+encodeURIComponent(email)+'%0AService: '+encodeURIComponent(service)+'%0A%0AMessage: '+encodeURIComponent(message);
    var url='https://wa.me/'+(form.getAttribute('data-wa-number')||'919989135087')+'?text='+text;
    window.open(url,'_blank','noopener,noreferrer');
  });
})();

(function(){
  var form=document.querySelector('[data-demo-form]');
  if(!form) return;
  var err=form.querySelector('[data-demo-error]');
  var ok=form.querySelector('[data-demo-ok]');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(err) err.hidden=true;
    if(ok) ok.hidden=true;
    var data=new FormData(form);
    var name=String(data.get('name')||'').trim();
    var business=String(data.get('business')||'').trim();
    var interest=String(data.get('interest')||'').trim();
    var message=String(data.get('message')||'').trim();
    var consent=data.get('consent');
    if(name.length<2||!business||!interest||message.length<10||!consent){
      if(err){err.hidden=false;err.textContent='Please complete all required fields.';}
      return;
    }
    if(ok) ok.hidden=false;
    form.reset();
  });
})();

(function(){
  var w=document.querySelector('[data-testid="demo-widget"]');
  if(!w) return;
  var out=w.querySelector('[data-testid="demo-output"]');
  var input=w.querySelector('[data-demo-input]');
  var connectors=[];
  var fallback="That's outside this demo's scripted examples. This simulation is not connected to a live AI and only shows a few predetermined responses. Try one of the suggested prompts below.";
  function set(t){ if(out) out.textContent=t; }
  function scriptedAnswer(raw){
    var q=String(raw||'').trim().toLowerCase().slice(0,200);
    if(!q) return fallback;
    if(/@|[+]?[0-9]{6,}/.test(q)) return fallback+" Please don't enter personal details — this demo doesn't store or send anything.";
    if(/price|cost|how much|₹|rs /.test(q)) return "Scripted answer: Starter is ₹14,999, Standard is ₹29,999. Custom is quoted after scope.";
    if(/time|day|week|delivery|long/.test(q)) return "Scripted answer: typical delivery is about seven days from confirmed scope. This is not a guaranteed SLA.";
    if(/pay|upi/.test(q)) return "Scripted answer: payment is by UPI only.";
    if(/service|offer|build|website|assistant|automation|agent/.test(q)) return "Scripted answer: Hermes Biz builds websites, AI assistants, chatbots, automation and agent systems.";
    return fallback;
  }
  w.addEventListener('click',function(e){
    var b=e.target.closest('[data-demo-action]');
    if(!b || !w.contains(b)) return;
    var a=b.getAttribute('data-demo-action');
    var v=b.getAttribute('data-value')||'';
    if(a==='site-view'){
      if(v==='home') set('Preview: Home page — headline, services summary, testimonial placeholder and contact CTA. Mockup only — no code generated or deployed.');
      else if(v==='services') set('Preview: Services page — four service cards with clear descriptions. Mockup only — no code generated or deployed.');
      else set('Preview: Contact page — WhatsApp and email section. No data is sent from this demo.');
    } else if(a==='site-theme'){
      set('Theme preview set to '+v+'. Mockup only — no code generated or deployed.');
    } else if(a==='assistant-submit'){
      set(scriptedAnswer(input ? input.value : ''));
    } else if(a==='assistant-ask'){
      set(scriptedAnswer(v));
    } else if(a==='support-intent'){
      if(v==='track') set('Scripted support reply: Sample order #1001 is marked packed. Sample data — illustrative only. No real order lookup was performed.');
      else if(v==='returns') set('Scripted support reply: In this example, returns are accepted within 7 days. Sample data — illustrative only.');
      else if(v==='pricing') set('Scripted support reply: Starter ₹14,999, Standard ₹29,999, Custom — quoted after scope.');
      else set('Scripted handoff: in a live build this would go to a human. Nothing was sent or created in this demo.');
    } else if(a==='automation-run'){
      set('Simulated run complete: 1) Enquiry captured 2) Details validated 3) Sample row added 4) Notification queued 5) Follow-up scheduled. No workflow was executed.');
    } else if(a==='automation-steps'){
      set('Workflow steps: Trigger → Condition → Action → Notification → Follow-up. Sample data — illustrative only.');
    } else if(a==='agent-goal'){
      if(v==='plan') set('Scripted agent plan: 1) Identify requirement 2) Draft scope 3) Check price tier 4) Prepare human handoff. Illustrative reasoning — no autonomous decisions.');
      else if(v==='steps') set('Scripted agent trace: Researcher → Planner → Writer → Reviewer → Human handoff. No tools were called.');
      else set('Sample output: Recommended Starter website demo, ₹14,999, scope to be confirmed. Sample data — illustrative only.');
    } else if(a==='connector'){
      var on=b.getAttribute('aria-pressed')==='true';
      b.setAttribute('aria-pressed',on?'false':'true');
      if(on){ connectors=connectors.filter(function(x){return x!==v;}); }
      else { connectors.push(v); }
      set('Connector '+v+' '+(on?'removed':'selected')+'. Conceptual flow — no systems connected.');
    } else if(a==='integration-map'){
      set(connectors.length ? 'Sample data flow: Website → '+connectors.join(' → ')+'. Conceptual flow — no systems connected.' : 'Select at least one connector first. Conceptual flow — no systems connected.');
    }
  });
  var reset=w.querySelector('[data-demo-reset]');
  if(reset && out && out.id !== 'three-status') reset.addEventListener('click',function(){
    if(input) input.value='';
    connectors=[];
    Array.prototype.forEach.call(w.querySelectorAll('[data-demo-action="connector"]'),function(x){x.setAttribute('aria-pressed','false');});
    set('Choose an option to begin.');
  });
})();
