/* Artha — illustrative SIP projection, subtle reveals, honest local-only form. */
(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__financeDemo={ready:true,reduced:false,calculations:0,formSubmits:0};
  window.__financeDemo.reduced=reduced;

  var fmt=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
  function compute(monthly,annual,years){
    var i=annual/12/100, n=years*12;
    var corpus=monthly*((Math.pow(1+i,n)-1)/i)*(1+i);
    return {corpus:Math.round(corpus),invested:monthly*n};
  }
  var sipForm=document.getElementById('sip-form');
  if(sipForm) sipForm.addEventListener('submit',function(e){
    e.preventDefault();
    var monthly=Number(document.getElementById('sip-monthly').value);
    var annual=Number(document.getElementById('sip-rate').value);
    var years=Number(document.getElementById('sip-years').value);
    var err=document.getElementById('sip-error');
    if(!Number.isFinite(monthly)||!Number.isFinite(annual)||!Number.isFinite(years)||
       monthly<500||monthly>1000000||annual<=0||annual>30||years<1||years>40){
      err.textContent='Please enter a monthly amount between ₹500 and ₹10,00,000, an annual figure between 0.5% and 30%, and between 1 and 40 years.';
      return;
    }
    err.textContent='';
    var r=compute(monthly,annual,years);
    document.getElementById('sip-corpus').textContent=fmt.format(r.corpus);
    document.getElementById('sip-invested').textContent=fmt.format(r.invested);
    document.getElementById('sip-gain').textContent=fmt.format(Math.max(0,r.corpus-r.invested));
    var note=document.querySelector('.result-note');
    note.textContent='Computed from the inputs above at a monthly compounding approximation over '+years+' year'+(years===1?'':'s')+'. It is a projection, not a forecast, and it assumes the stated figure holds for the entire period.';
    window.__financeDemo.calculations++;
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

  /* Honest demo form. */
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
    window.__financeDemo.formSubmits++;
    form.reset();
  });
})();
