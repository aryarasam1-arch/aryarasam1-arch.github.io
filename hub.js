/* HERMES BIZ hub — quote builder, FAQ accordion, local-only form, subtle reveals. */
(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__hubDemo={ready:true,reduced:false,quotes:0,faqOpens:0,formSubmits:0};
  window.__hubDemo.reduced=reduced;

  /* Quote builder — generates a reviewable WhatsApp link, sends nothing. */
  var qf=document.getElementById('quote-form');
  if(qf){
    var service=document.getElementById('q-service'),
        size=document.getElementById('q-size'),
        timing=document.getElementById('q-timing'),
        extra=document.getElementById('q-extra'),
        summary=document.getElementById('quote-summary'),
        link=document.getElementById('quote-link');
    function build(){
      var s=service.value, z=size.value, t=timing.value, e=extra.value.trim();
      if(!s||!z||!t){
        summary.textContent='Select a service, scope and timing to build your message.';
        link.setAttribute('href','https://wa.me/919989135087');
        link.setAttribute('aria-disabled','true');
        return;
      }
      var lines=[
        'Hi Hermes Biz, I would like a quote.',
        'Service: '+s,
        'Scope: '+z,
        'Timing: '+t
      ];
      if(e) lines.push('Details: '+e);
      lines.push('Please share next steps when convenient.');
      var msg=lines.join('\n');
      summary.textContent=msg;
      link.setAttribute('href','https://wa.me/919989135087?text='+encodeURIComponent(msg));
      link.setAttribute('aria-disabled','false');
      window.__hubDemo.quotes++;
    }
    [service,size,timing,extra].forEach(function(el){ el.addEventListener('change',build); el.addEventListener('input',build); });
  }

  /* FAQ accordion. */
  var qs=Array.prototype.slice.call(document.querySelectorAll('.acc-q'));
  qs.forEach(function(btn){
    btn.addEventListener('click',function(){
      var panel=document.getElementById(btn.getAttribute('aria-controls'));
      var open=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded',String(!open));
      if(panel) panel.hidden=open;
      var sign=btn.querySelector('span');
      if(sign) sign.textContent=open?'+':'−';
      if(!open) window.__hubDemo.faqOpens++;
    });
  });

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

  /* Honest local-only enquiry form. */
  var form=document.getElementById('contact-form');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var out=document.getElementById('form-status');
    var name=document.getElementById('c-name'),email=document.getElementById('c-email'),
        topic=document.getElementById('c-topic'),note=document.getElementById('c-note'),
        consent=document.getElementById('c-consent');
    var emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if(!name.value.trim()||!emailOk||!topic.value||!note.value.trim()||!consent.checked){
      out.style.color='#8A5A2B';
      out.textContent='Please complete every field with a valid email address and confirm consent.';
      return;
    }
    out.style.color='';
    out.textContent='Thank you — this is a demo, so nothing was sent or stored.';
    window.__hubDemo.formSubmits++;
    form.reset();
  });
})();
