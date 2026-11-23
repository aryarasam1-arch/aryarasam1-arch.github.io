/* Aarogya clinic demo — front-desk FAQ, subtle reveals, local-only form. */
(function(){
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__clinicDemo={ready:true,reduced,faq:'timings',formSubmits:0};

  /* Front-desk FAQ — timings, parking and slots ONLY. */
  const FAQ={
    timings:{
      q:'What are the clinic timings?',
      a:'The clinic is open Monday to Friday, 9:00–13:00 and 17:00–20:00, and Saturday 9:00–14:00. It is closed on Sundays. These are illustrative hours for this fictional practice.'
    },
    parking:{
      q:'Where can I park?',
      a:'This is a fictional practice with no physical location. For the concept, the front desk would point visitors to street parking or the nearest public lot, and confirm the easiest option when an appointment is requested.'
    },
    slots:{
      q:'How do I check appointment slots?',
      a:'Send an appointment request using the WhatsApp link on this page. The front desk would confirm available slots in reply. This demo does not book, store or share any appointment data.'
    }
  };
  const tabs=Array.prototype.slice.call(document.querySelectorAll('[data-faq]'));
  const q=document.getElementById('faq-q');
  const a=document.getElementById('faq-a');
  const panel=document.getElementById('faq-answer');
  function setFaq(key){
    const item=FAQ[key];
    if(!item||!q||!a) return;
    q.textContent=item.q;
    a.textContent=item.a;
    tabs.forEach(function(b){
      b.setAttribute('aria-selected',String(b.getAttribute('data-faq')===key));
    });
    if(panel){
      const active=tabs.filter(function(b){ return b.getAttribute('data-faq')===key; })[0];
      if(active) panel.setAttribute('aria-labelledby',active.id);
    }
    window.__clinicDemo.faq=key;
  }
  tabs.forEach(function(b){ b.addEventListener('click',function(){ setFaq(b.getAttribute('data-faq')); }); });
  setFaq('timings');

  /* Subtle scroll reveals; static by default when reduced motion is requested. */
  if(!reduced && window.gsap && window.ScrollTrigger && document.querySelectorAll('.reveal').length){
    window.gsap.registerPlugin(window.ScrollTrigger);
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'),function(el){
      window.gsap.from(el,{
        y:18,opacity:0,duration:.65,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 92%',once:true}
      });
    });
  }

  /* Honest demo form: validates locally, never sends or stores anything. */
  const form=document.getElementById('contact-form');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    const out=document.getElementById('form-status');
    const name=document.getElementById('f-name'),email=document.getElementById('f-email'),
          topic=document.getElementById('f-topic'),note=document.getElementById('f-note'),
          consent=document.getElementById('f-consent');
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if(!name.value.trim()||!emailOk||!topic.value||!note.value.trim()||!consent.checked){
      out.style.color='#8A5A2B';
      out.textContent='Please complete every field with a valid email address and confirm consent.';
      return;
    }
    out.style.color='';
    out.textContent='Thanks — this is a demo, so nothing was sent or stored.';
    window.__clinicDemo.formSubmits++;
    form.reset();
  });
})();
