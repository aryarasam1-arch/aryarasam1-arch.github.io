import * as THREE from './three.module.min.js';

const canvas = document.getElementById('website-3d-canvas');
const status = document.getElementById('three-status');
const viewTitle = document.getElementById('three-view-title');
const buttons = Array.from(document.querySelectorAll('[data-view]'));
const resetBtn = document.querySelector('[data-demo-reset]');

function showFallback(error) {
  if (canvas) canvas.hidden = true;
  const wrap = canvas ? canvas.closest('.three-viewport-wrap') : null;
  if (wrap && !wrap.querySelector('.three-fallback')) {
    const box = document.createElement('div');
    box.className = 'three-fallback';
    box.setAttribute('role', 'status');
    const label = document.createElement('p');
    label.className = 'label';
    label.textContent = '3D PREVIEW UNAVAILABLE';
    const note = document.createElement('p');
    note.textContent = 'The interactive 3D view could not start in this browser. All service details and price tiers below remain available.';
    box.appendChild(label);
    box.appendChild(note);
    wrap.appendChild(box);
  }
  if (status) status.textContent = '3D preview unavailable. Service details and price tiers below remain available.';
  if (viewTitle) viewTitle.textContent = 'Unavailable';
  if (window.console && console.warn) console.warn('3D preview disabled:', error);
}

if (canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (error) {
    showFallback(error);
  }

  if (renderer) {
    renderer.setClearColor(0x07120e, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07120e);
  scene.fog = new THREE.Fog(0x07120e, 7, 15);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.3, 6.6);

  scene.add(new THREE.HemisphereLight(0xd8ffe8, 0x06100b, 2.2));
  const dir = new THREE.DirectionalLight(0xffffff, 1.4);
  dir.position.set(4, 5, 6);
  scene.add(dir);

  const group = new THREE.Group();
  scene.add(group);

  const VIEWS = [
    { name: 'Home', eyebrow: 'HERMES BIZ · SAMPLE', title: 'Websites that work hard for your business', lines: ['Clear message.', 'Fast on mobile.', 'Easy to maintain.'], price: 'Starter ₹14,999. Standard ₹29,999. Custom quoted after scope.' },
    { name: 'Services', eyebrow: 'PACKAGE OPTIONS', title: 'Website development', lines: ['Plan → Research → Refine', 'Implement → Verify → Handover', 'Two revisions included'], price: 'Starter ₹14,999. Standard ₹29,999. Custom quoted after scope.' },
    { name: 'Contact', eyebrow: 'NEXT STEP', title: 'Start a project', lines: ['Share your requirement.', 'Get a fixed scope and price.', 'Approve before work starts.'], price: 'Demo only — no enquiry is sent or stored.' }
  ];

  function wrapText(g, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (g.measureText(test).width > maxWidth && line) { g.fillText(line, x, y); line = word; y += lineHeight; }
      else line = test;
    }
    if (line) g.fillText(line, x, y);
  }

  function panelTexture(view) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 640;
    const g = c.getContext('2d');
    g.fillStyle = '#f3f7f3'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#07120e'; g.fillRect(0, 0, c.width, 86);
    g.fillStyle = '#f5a623'; g.font = '700 26px ui-monospace, Menlo, Consolas, monospace';
    g.fillText(view.eyebrow, 54, 54);
    g.fillStyle = '#07120e'; g.font = '700 58px Arial';
    wrapText(g, view.title, 54, 176, 900, 66);
    let y = 330;
    g.font = '34px Arial';
    view.lines.forEach((line, i) => {
      g.fillStyle = '#f5a623'; g.fillRect(54, y - 24, 28, 28);
      g.fillStyle = '#07120e'; g.fillText(String(i + 1), 60, y - 3);
      g.fillStyle = '#244033'; g.fillText(line, 104, y);
      y += 58;
    });
    g.fillStyle = '#e8f0ea'; g.fillRect(0, 540, c.width, 100);
    g.fillStyle = '#07120e'; g.font = '700 28px Arial';
    wrapText(g, view.price, 54, 590, 920, 34);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  const panelGeo = new THREE.BoxGeometry(3.7, 2.35, 0.13);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x9cb3a6, roughness: 0.55, metalness: 0.15 });
  VIEWS.forEach((view, i) => {
    const panel = new THREE.Mesh(panelGeo, frameMat);
    const angle = i * Math.PI * 2 / 3;
    panel.position.set(Math.sin(angle) * 2.15, 0, Math.cos(angle) * 2.15);
    panel.rotation.y = angle;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(3.48, 2.13), new THREE.MeshBasicMaterial({ map: panelTexture(view) }));
    face.position.z = 0.071;
    panel.add(face);
    group.add(panel);
  });

  let active = 0;
  let target = 0;
  let zoom = 6.6;
  let dragging = false;
  let lastX = 0;
  let motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoSpin = motion;
  let paused = document.hidden;

  function setView(i, announce = true) {
    active = ((i % 3) + 3) % 3;
    target = -active * Math.PI * 2 / 3;
    autoSpin = false;
    buttons.forEach((b, idx) => b.setAttribute('aria-pressed', String(idx === active)));
    if (viewTitle) viewTitle.textContent = VIEWS[active].name;
    if (announce && status) status.textContent = `${VIEWS[active].name} view. ${VIEWS[active].price}`;
  }

  buttons.forEach((b, i) => b.addEventListener('click', () => setView(i)));
  if (resetBtn) resetBtn.addEventListener('click', () => { target = 0; zoom = 6.6; setView(0); });

  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    group.rotation.y += (e.clientX - lastX) * 0.008;
    lastX = e.clientX;
    target = group.rotation.y;
  });
  canvas.addEventListener('pointerup', e => { dragging = false; canvas.releasePointerCapture(e.pointerId); });
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = THREE.MathUtils.clamp(zoom + Math.sign(e.deltaY) * 0.35, 4.5, 9); }, { passive: false });
  canvas.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { setView(active - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { setView(active + 1); e.preventDefault(); }
    else if (['1', '2', '3'].includes(e.key)) { setView(Number(e.key) - 1); e.preventDefault(); }
    else if (e.key === 'Home') { target = 0; zoom = 6.6; setView(0); e.preventDefault(); }
  });

  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
  const io = new IntersectionObserver(entries => { paused = !entries[0].isIntersecting || document.hidden; });
  io.observe(canvas);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(1, rect.height);
    camera.fov = rect.width < 600 ? 52 : 42;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();
  setView(0, false);
  renderer.render(scene, camera);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!dragging) {
      if (autoSpin) group.rotation.y -= dt * 0.12;
      else group.rotation.y += (target - group.rotation.y) * Math.min(1, dt * 8);
    }
    camera.position.z += (zoom - camera.position.z) * Math.min(1, dt * 6);
    renderer.render(scene, camera);
  }
  animate();
  }
}

