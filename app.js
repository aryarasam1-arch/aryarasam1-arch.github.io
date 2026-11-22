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
    if(name.length<2||!business||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!service||message.length<10){
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
