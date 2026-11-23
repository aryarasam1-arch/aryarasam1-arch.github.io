/**
 * FOLD — editorial studio site.
 * Motion: GSAP + ScrollTrigger + SplitText + Lenis (vendored, commercial-free).
 * WebGL: one tiny custom GLSL fold-field on a full-bleed quad; no banned primitives.
 */
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const html=document.documentElement;
if(reduced) html.classList.add('reduced-motion');

window.__app={ready:true,fallback:false,reduced,canvases:0,frames:0};
window.__ready=true;

/* ---------- motion layer ---------- */
(function motion(){
  const g=window.gsap;
  if(!g||!window.ScrollTrigger||!window.SplitText||!window.Lenis||reduced) return;
  try{
    g.registerPlugin(window.ScrollTrigger,window.SplitText);
    const lenis=new window.Lenis({duration:1.05,smoothWheel:true,wheelMultiplier:.9});
    lenis.on('scroll',window.ScrollTrigger.update);
    g.ticker.add(t=>lenis.raf(t*1000));
    g.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        const target=document.querySelector(a.getAttribute('href'));
        if(target){ e.preventDefault(); lenis.scrollTo(target,{offset:-72}); }
      });
    });
    document.fonts.ready.then(()=>{
      document.querySelectorAll('[data-split]').forEach(el=>{
        const split=new window.SplitText(el,{type:'lines',linesClass:'split-line'});
        g.from(split.lines,{
          yPercent:115,opacity:0,duration:1.05,stagger:.09,ease:'power3.out',
          scrollTrigger:{trigger:el,start:'top 88%',once:true}
        });
      });
      window.ScrollTrigger.refresh();
    });
    g.utils.toArray('.project,.steps article,.interlude blockquote').forEach(el=>{
      g.from(el,{y:28,opacity:0,duration:.9,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 92%',once:true}});
    });
    window.ScrollTrigger.refresh();
  }catch(err){
    console.warn('Motion layer unavailable; static content remains.',err);
  }
})();

/* ---------- restrained GLSL accent ---------- */
const VERT=`
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=vec4(position,1.0); }
`;
const FRAG=`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  void main(){
    vec2 uv=vUv;
    vec2 p=uv-0.5;
    p.x*=uRes.x/max(uRes.y,1.0);
    float t=uTime*0.06+uScroll*0.30;
    float fold=sin(p.x*2.4+sin(p.y*2.0+t)*1.15+t)*0.5+0.5;
    fold=smoothstep(0.12,0.88,fold);
    float band=sin((p.y+fold*0.22)*6.2-t*1.1)*0.5+0.5;
    vec3 col=mix(uA,uB,fold);
    col=mix(col,uC,band*0.20);
    vec2 focus=vec2(0.18+uMouse.x*0.10,-0.08+uMouse.y*0.08);
    float sweep=smoothstep(0.75,0.0,length(p-focus));
    col+=uC*sweep*0.07;
    float grain=(hash(gl_FragCoord.xy+floor(uTime*10.0))-0.5)*0.018;
    col+=grain;
    gl_FragColor=vec4(col,1.0);
  }
`;

const PALETTES={
  hero:{a:[0.925,0.900,0.855],b:[0.862,0.816,0.752],c:[0.722,0.329,0.208]},
  interlude:{a:[0.130,0.184,0.149],b:[0.220,0.286,0.232],c:[0.906,0.635,0.514]}
};

function webglAvailable(){
  try{
    const c=document.createElement('canvas');
    const gl=c.getContext('webgl2')||c.getContext('webgl');
    if(!gl) return false;
    const lose=gl.getExtension('WEBGL_lose_context'); if(lose) lose.loseContext();
    return true;
  }catch(e){ return false; }
}

async function initAccent(){
  if(reduced||!webglAvailable()){
    html.classList.add('no-webgl');
    window.__app.fallback=true;
    return;
  }
  try{
    const THREE=await import('../vendor/three.module.min.js');
    const mounts=[
      {canvas:document.getElementById('gl'),wrap:document.getElementById('gl-wrap'),palette:PALETTES.hero},
      {canvas:document.getElementById('gl2'),wrap:document.getElementById('gl-wrap-2'),palette:PALETTES.interlude}
    ].filter(m=>m.canvas&&m.wrap);

    mounts.forEach((m,index)=>{
      let renderer;
      try{
        renderer=new THREE.WebGLRenderer({canvas:m.canvas,antialias:false,alpha:false,powerPreference:'low-power'});
      }catch(e){ m.wrap.style.display='none'; return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      const scene=new THREE.Scene();
      const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
      const pal=m.palette;
      const uniforms={
        uTime:{value:0},uScroll:{value:0},
        uRes:{value:new THREE.Vector2(1,1)},uMouse:{value:new THREE.Vector2(0,0)},
        uA:{value:new THREE.Vector3(...pal.a)},uB:{value:new THREE.Vector3(...pal.b)},
        uC:{value:new THREE.Vector3(...pal.c)}
      };
      const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),
        new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:FRAG,uniforms,depthTest:false,depthWrite:false}));
      scene.add(quad);

      const resize=()=>{
        const w=Math.max(1,m.wrap.clientWidth),h=Math.max(1,m.wrap.clientHeight);
        renderer.setSize(w,h,false);
        uniforms.uRes.value.set(w,h);
      };
      if('ResizeObserver' in window) new ResizeObserver(resize).observe(m.wrap);
      window.addEventListener('resize',resize,{passive:true});
      resize();

      let visible=true,running=false,raf=0;
      const clock=new THREE.Clock();
      function frame(){
        if(!running) return;
        raf=requestAnimationFrame(frame);
        const dt=Math.min(.05,clock.getDelta());
        uniforms.uTime.value+=dt;
        uniforms.uScroll.value=window.scrollY/Math.max(1,document.body.scrollHeight-window.innerHeight);
        renderer.render(scene,camera);
        window.__app.frames++;
      }
      function start(){ if(!running&&visible&&!document.hidden){ running=true; clock.getDelta(); frame(); } }
      function stop(){ running=false; cancelAnimationFrame(raf); }
      document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
      if('IntersectionObserver' in window){
        new IntersectionObserver(es=>{ visible=es.some(e=>e.isIntersecting); visible?start():stop(); },
          {threshold:0}).observe(m.wrap);
      }
      window.addEventListener('pointermove',e=>{
        uniforms.uMouse.value.set((e.clientX/window.innerWidth-.5)*2,(e.clientY/window.innerHeight-.5)*2);
      },{passive:true});
      resize(); renderer.render(scene,camera); start();
      window.__app.canvases++;
      if(index===0){ window.__app.renderer=renderer; }
    });
    if(window.__app.canvases===0){ html.classList.add('no-webgl'); window.__app.fallback=true; }
  }catch(err){
    console.warn('WebGL accent unavailable; static layout shown.',err);
    html.classList.add('no-webgl'); window.__app.fallback=true;
  }
}
initAccent();

/* ---------- working demo enquiry flow ---------- */
const form=document.getElementById('enquiry');
if(form) form.addEventListener('submit',e=>{
  e.preventDefault();
  const out=document.getElementById('status');
  const name=document.getElementById('name'),email=document.getElementById('email'),
        type=document.getElementById('type'),note=document.getElementById('note'),
        consent=document.getElementById('consent');
  if(!name.value.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())||
     !type.value||!note.value.trim()||!consent.checked){
    out.style.color='#B85435';
    out.textContent='Please complete every field with a valid email address and confirm consent.';
    return;
  }
  out.style.color='';
  out.textContent='Thank you — this is a demo, so nothing was sent or stored.';
  form.reset();
});
