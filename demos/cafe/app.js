/* Kora — filterable menu, subtle reveals, honest local-only form. */
(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__cafeDemo={ready:true,reduced:false,category:'coffee',formSubmits:0};
  window.__cafeDemo.reduced=reduced;

  var MENU={
    coffee:[
      {name:'Espresso',desc:'Single origin, pulled short',price:'₹120'},
      {name:'Flat white',desc:'Double shot, silky milk',price:'₹160'},
      {name:'Filter coffee',desc:'Slow brewed, served black',price:'₹150'},
      {name:'Cold brew',desc:'Steeped overnight',price:'₹170'}
    ],
    breakfast:[
      {name:'Masala omelette',desc:'Soft eggs, herbs, toast',price:'₹220'},
      {name:'Avocado toast',desc:'Sourdough, lemon, chilli',price:'₹240'},
      {name:'Granola bowl',desc:'Yogurt, fruit, honey',price:'₹180'},
      {name:'Banana pancakes',desc:'Maple and a little butter',price:'₹210'}
    ],
    bakery:[
      {name:'Butter croissant',desc:'Laminated, flaky, warm',price:'₹140'},
      {name:'Cardamom bun',desc:'Soft, fragrant, glazed',price:'₹150'},
      {name:'Banana bread',desc:'Toasted, with cream',price:'₹160'},
      {name:'Seeded sourdough',desc:'Baked each morning',price:'₹180'}
    ]
  };
  var tabs=Array.prototype.slice.call(document.querySelectorAll('[data-menu]'));
  var note=document.getElementById('menu-note');
  var list=document.getElementById('menu-items');
  var panel=document.getElementById('menu-panel');
  function render(key){
    var items=MENU[key];
    if(!items||!note||!list) return;
    note.textContent=key.charAt(0).toUpperCase()+key.slice(1);
    list.innerHTML='';
    items.forEach(function(item){
      var li=document.createElement('li');
      var div=document.createElement('div');
      var h=document.createElement('h3');h.textContent=item.name;
      var p=document.createElement('p');p.textContent=item.desc;
      var price=document.createElement('span');price.textContent=item.price;
      div.appendChild(h);div.appendChild(p);
      li.appendChild(div);li.appendChild(price);
      list.appendChild(li);
    });
    tabs.forEach(function(b){ b.setAttribute('aria-selected',String(b.getAttribute('data-menu')===key)); });
    if(panel){
      var active=tabs.filter(function(b){ return b.getAttribute('data-menu')===key; })[0];
      if(active) panel.setAttribute('aria-labelledby',active.id);
    }
    window.__cafeDemo.category=key;
  }
  tabs.forEach(function(b){ b.addEventListener('click',function(){ render(b.getAttribute('data-menu')); }); });
  render('coffee');

  if(!reduced && window.gsap && window.ScrollTrigger && document.querySelectorAll('.reveal').length){
    window.gsap.registerPlugin(window.ScrollTrigger);
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'),function(el){
      window.gsap.from(el,{
        y:16,opacity:0,duration:.65,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 92%',once:true}
      });
    });
  }

  var form=document.getElementById('contact-form');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var out=document.getElementById('form-status');
    var name=document.getElementById('c-name'),email=document.getElementById('c-email'),
        date=document.getElementById('c-date'),guests=document.getElementById('c-guests'),
        consent=document.getElementById('c-consent');
    var emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if(!name.value.trim()||!emailOk||!date.value||!guests.value||!consent.checked){
      out.style.color='#8A5A2B';
      out.textContent='Please complete every field with a valid email address and confirm consent.';
      return;
    }
    out.style.color='';
    out.textContent='Thank you — this is a demo, so nothing was sent or stored.';
    window.__cafeDemo.formSubmits++;
    form.reset();
  });
})();
