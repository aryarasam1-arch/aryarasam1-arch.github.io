/* Mehta & Rao — subtle reveals and an honest local-only consultation form. */
(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__lawDemo={ready:true,reduced:false,formSubmits:0};
  window.__lawDemo.reduced=reduced;

  if(!reduced && window.gsap && window.ScrollTrigger && document.querySelectorAll('.reveal').length){
    window.gsap.registerPlugin(window.ScrollTrigger);
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'),function(el){
      window.gsap.from(el,{
        y:16,opacity:0,duration:.65,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 92%',once:true}
      });
    });
  }

  var form=document.getElementById('consult-form');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var out=document.getElementById('form-status');
    var name=document.getElementById('c-name'),email=document.getElementById('c-email'),
        area=document.getElementById('c-area'),note=document.getElementById('c-note'),
        consent=document.getElementById('c-consent');
    var emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if(!name.value.trim()||!emailOk||!area.value||!note.value.trim()||!consent.checked){
      out.style.color='#8A5A2B';
      out.textContent='Please complete every field with a valid email address and confirm consent.';
      return;
    }
    out.style.color='';
    out.textContent='Thank you — this is a demo, so nothing was sent or stored.';
    window.__lawDemo.formSubmits++;
    form.reset();
  });
})();
