/* Deshmukh & Co. — checklist tabs, subtle reveals, honest local-only form. */
(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__taxDemo={ready:true,reduced:false,profile:'salaried',formSubmits:0};
  window.__taxDemo.reduced=reduced;

  /* Document checklist — general guide only, switches fully in JS. */
  var PROFILES={
    salaried:{
      note:'Salaried — general documents',
      items:['Form 16 or salary slips','Interest certificates from banks','Investment proofs for deductions','House rent receipts, if applicable']
    },
    freelancer:{
      note:'Freelancer — general documents',
      items:['Invoices issued during the year','Bank statements for all accounts','Expense records and receipts','GST registration details, if applicable']
    },
    business:{
      note:'Business — general documents',
      items:['Books of account and ledgers','GST filings and invoices','Bank statements for business accounts','Incorporation or registration documents']
    }
  };
  var tabs=Array.prototype.slice.call(document.querySelectorAll('[data-profile]'));
  var note=document.getElementById('panel-note');
  var items=document.getElementById('items');
  var panel=document.getElementById('checklist-panel');
  function setProfile(key){
    var p=PROFILES[key];
    if(!p||!note||!items) return;
    note.textContent=p.note;
    items.innerHTML='';
    p.items.forEach(function(text){
      var li=document.createElement('li');
      li.textContent=text;
      items.appendChild(li);
    });
    tabs.forEach(function(b){ b.setAttribute('aria-selected',String(b.getAttribute('data-profile')===key)); });
    if(panel){
      var active=tabs.filter(function(b){ return b.getAttribute('data-profile')===key; })[0];
      if(active) panel.setAttribute('aria-labelledby',active.id);
    }
    window.__taxDemo.profile=key;
  }
  tabs.forEach(function(b){ b.addEventListener('click',function(){ setProfile(b.getAttribute('data-profile')); }); });
  setProfile('salaried');

  /* Subtle reveals; static under reduced motion. */
  if(!reduced && window.gsap && window.ScrollTrigger && document.querySelectorAll('.reveal').length){
    window.gsap.registerPlugin(window.ScrollTrigger);
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'),function(el){
      window.gsap.from(el,{
        y:16,opacity:0,duration:.65,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 92%',once:true}
      });
    });
  }

  /* Honest demo form. */
  var form=document.getElementById('contact-form');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var out=document.getElementById('form-status');
    var name=document.getElementById('c-name'),email=document.getElementById('c-email'),
        topic=document.getElementById('c-topic'),note2=document.getElementById('c-note'),
        consent=document.getElementById('c-consent');
    var emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if(!name.value.trim()||!emailOk||!topic.value||!note2.value.trim()||!consent.checked){
      out.style.color='#8A5A2B';
      out.textContent='Please complete every field with a valid email address and confirm consent.';
      return;
    }
    out.style.color='';
    out.textContent='Thank you — this is a demo, so nothing was sent or stored.';
    window.__taxDemo.formSubmits++;
    form.reset();
  });
})();
