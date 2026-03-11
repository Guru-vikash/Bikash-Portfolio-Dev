// ═══════════════════════════════════════════════════════
//  ALL JS — SINGLE SCRIPT BLOCK — NO EXTERNAL REFERENCES
// ═══════════════════════════════════════════════════════

// ── SECTION MAP ──────────────────────────────────────
// 6 cube faces → 6 section keys (in BoxGeometry material order)
// BoxGeometry: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z(front), 5=-Z(back)
var SECTIONS = [
  { name:'About Me',    key:'about' },
  { name:'Projects',    key:'projects' },
  { name:'Services',    key:'services' },
  { name:'Blog',        key:'blog' },
  { name:'Skills',      key:'skills' },
  { name:'Experience',  key:'experience' }
];
// Contact & Resume accessible via nav buttons only
var NEONS = ['#00ffdd','#ff2060','#7c5cfc','#00e5a0','#ffaa00','#f472b6'];

// ── CURSOR ────────────────────────────────────────────
var CD = document.getElementById('CD');
var CR = document.getElementById('CR');
var cmx=0, cmy=0, crx=0, cry=0;
document.addEventListener('mousemove', function(e){ cmx=e.clientX; cmy=e.clientY; CD.style.left=cmx+'px'; CD.style.top=cmy+'px'; });
(function cursorLoop(){
  crx += (cmx-crx)*0.1; cry += (cmy-cry)*0.1;
  CR.style.left=crx+'px'; CR.style.top=cry+'px';
  requestAnimationFrame(cursorLoop);
})();
var hoverEls = document.querySelectorAll('button,a,.pj-card,.sv-card,.bl-hero,.bl-mini,.tech-item,.cert-it,.ach-it,.ct-item');
hoverEls.forEach(function(el){
  el.addEventListener('mouseenter',function(){ document.body.classList.add('H'); });
  el.addEventListener('mouseleave',function(){ document.body.classList.remove('H'); });
});

// ── STAR PARTICLE BG ──────────────────────────────────
(function(){
  var c = document.getElementById('SC');
  var ctx = c.getContext('2d');
  var W, H, stars = [];
  function resize(){
    W = c.width = innerWidth; H = c.height = innerHeight;
    stars = [];
    for(var i=0;i<100;i++){
      stars.push({ x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.15, vy:(Math.random()-.5)*.15,
        r:Math.random()*1.1+.3, o:Math.random()*.6+.2 });
    }
  }
  resize(); window.addEventListener('resize', resize);
  var lt=0;
  function draw(t){
    var dt = Math.min((t-lt)/16,3); lt=t;
    ctx.clearRect(0,0,W,H);
    // nebula glow
    var g=ctx.createRadialGradient(W*.25,H*.35,0,W*.25,H*.35,W*.5);
    g.addColorStop(0,'rgba(99,102,241,.055)'); g.addColorStop(.5,'rgba(0,255,221,.02)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    var g2=ctx.createRadialGradient(W*.78,H*.68,0,W*.78,H*.68,W*.38);
    g2.addColorStop(0,'rgba(255,32,96,.04)'); g2.addColorStop(1,'transparent');
    ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){
      var s=stars[i];
      s.x+=s.vx*dt; s.y+=s.vy*dt;
      if(s.x<0||s.x>W)s.vx*=-1; if(s.y<0||s.y>H)s.vy*=-1;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(0,255,221,'+s.o+')'; ctx.fill();
      for(var j=i+1;j<stars.length;j++){
        var q=stars[j], dx=q.x-s.x, dy=q.y-s.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<85){ ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle='rgba(0,255,221,'+(0.07*(1-d/85))+')'; ctx.lineWidth=.5; ctx.stroke(); }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ── THREE.JS DICE ──────────────────────────────────────
var scene, cam, renderer, cube, rings=[], halo;
var rolling = false;
var mouseNX=0, mouseNY=0;
var shellOpen = false;

function hexRGB(hex){
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}

function makeTex(label, color, idx){
  var cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  var c = cv.getContext('2d');
  // bg
  c.fillStyle='#03050f'; c.fillRect(0,0,512,512);
  // subtle grid
  c.strokeStyle='rgba(255,255,255,.04)'; c.lineWidth=1;
  for(var i=0;i<=512;i+=32){ c.beginPath(); c.moveTo(i,0); c.lineTo(i,512); c.stroke(); c.beginPath(); c.moveTo(0,i); c.lineTo(512,i); c.stroke(); }
  // corner lines
  var L=72; c.strokeStyle=color; c.lineWidth=3;
  c.beginPath(); c.moveTo(20,20); c.lineTo(20+L,20); c.stroke();
  c.beginPath(); c.moveTo(20,20); c.lineTo(20,20+L); c.stroke();
  c.beginPath(); c.moveTo(492,20); c.lineTo(492-L,20); c.stroke();
  c.beginPath(); c.moveTo(492,20); c.lineTo(492,20+L); c.stroke();
  c.beginPath(); c.moveTo(20,492); c.lineTo(20+L,492); c.stroke();
  c.beginPath(); c.moveTo(20,492); c.lineTo(20,492-L); c.stroke();
  c.beginPath(); c.moveTo(492,492); c.lineTo(492-L,492); c.stroke();
  c.beginPath(); c.moveTo(492,492); c.lineTo(492,492-L); c.stroke();
  // index
  c.font='bold 26px DM Mono,monospace'; c.fillStyle=color; c.globalAlpha=.55; c.textAlign='left';
  c.fillText('0'+(idx+1),26,50); c.globalAlpha=1;
  // center radial glow
  var grd=c.createRadialGradient(256,256,0,256,256,175);
  var rgb=hexRGB(color);
  grd.addColorStop(0,'rgba('+rgb+',.16)'); grd.addColorStop(1,'transparent');
  c.fillStyle=grd; c.fillRect(0,0,512,512);
  // label text
  c.textAlign='center'; c.shadowColor=color; c.shadowBlur=28;
  var words=label.split(' ');
  if(words.length===1){
    c.font='bold 82px Bebas Neue,sans-serif'; c.fillStyle=color;
    c.fillText(label,256,295);
  } else {
    c.font='bold 68px Bebas Neue,sans-serif'; c.fillStyle=color;
    c.fillText(words[0],256,250);
    c.fillStyle='rgba(238,242,255,.9)'; c.shadowBlur=12;
    c.fillText(words[1],256,332);
  }
  c.shadowBlur=0;
  // corner dots
  c.fillStyle=color;
  [[62,62],[450,62],[62,450],[450,450]].forEach(function(p){
    c.beginPath(); c.arc(p[0],p[1],5.5,0,Math.PI*2); c.fill();
  });
  return new THREE.CanvasTexture(cv);
}

function initDice(){
  var canvas = document.getElementById('DC');
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, 0.1, 100);
  cam.position.set(0,0,5.5);
  renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Lights
  scene.add(new THREE.AmbientLight(0x1a2a44, 3));
  var l1=new THREE.PointLight(0x00ffdd,6,20); l1.position.set(5,5,5); scene.add(l1);
  var l2=new THREE.PointLight(0xff2060,4,16); l2.position.set(-5,-3,3); scene.add(l2);
  var l3=new THREE.PointLight(0x7c5cfc,3,14); l3.position.set(0,5,-4); scene.add(l3);
  var l4=new THREE.PointLight(0xffaa00,2,12); l4.position.set(3,-4,2); scene.add(l4);

  // Cube — 6 faces, BoxGeometry material order: +X,-X,+Y,-Y,+Z,-Z
  var geo = new THREE.BoxGeometry(2,2,2);
  var mats = [];
  for(var i=0;i<6;i++){
    mats.push(new THREE.MeshStandardMaterial({
      map: makeTex(SECTIONS[i].name, NEONS[i], i),
      metalness:.35, roughness:.25,
      emissive: new THREE.Color(NEONS[i]),
      emissiveIntensity: .05
    }));
  }
  cube = new THREE.Mesh(geo, mats);
  scene.add(cube);

  // Edge wireframe
  var edgeGeo = new THREE.EdgesGeometry(geo);
  var edgeMesh = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({color:0x00ffdd, transparent:true, opacity:.16}));
  cube.add(edgeMesh);

  // Orbit rings
  var ringCfg = [
    {r:2.8,tube:.012,rx:.5,ry:0,rz:0,col:0x00ffdd,op:.16},
    {r:3.1,tube:.008,rx:0,ry:.3,rz:1.2,col:0xff2060,op:.11},
    {r:3.4,tube:.006,rx:1.2,ry:.5,rz:0,col:0x7c5cfc,op:.09}
  ];
  ringCfg.forEach(function(cfg){
    var rg=new THREE.TorusGeometry(cfg.r,cfg.tube,8,80);
    var rm=new THREE.MeshBasicMaterial({color:cfg.col,transparent:true,opacity:cfg.op});
    var mesh=new THREE.Mesh(rg,rm);
    mesh.rotation.set(cfg.rx,cfg.ry,cfg.rz);
    scene.add(mesh); rings.push(mesh);
  });

  // Halo particles
  var pc=280, pg=new THREE.BufferGeometry(), pp=new Float32Array(pc*3);
  for(var i=0;i<pc;i++){
    var phi=Math.acos(2*Math.random()-1), theta=Math.random()*Math.PI*2, r=3+Math.random()*.9;
    pp[i*3]=r*Math.sin(phi)*Math.cos(theta);
    pp[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
    pp[i*3+2]=r*Math.cos(phi);
  }
  pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
  halo=new THREE.Points(pg,new THREE.PointsMaterial({color:0x00ffdd,size:.045,transparent:true,opacity:.45,sizeAttenuation:true}));
  scene.add(halo);

  // Click dice to roll
  canvas.addEventListener('click', function(){ if(!rolling && !shellOpen) doRoll(); });

  // Mouse for hover rotation
  document.addEventListener('mousemove', function(e){
    if(rolling||shellOpen) return;
    mouseNX = (e.clientX/innerWidth-.5)*2;
    mouseNY = (e.clientY/innerHeight-.5)*2;
  });

  // Show hover hint on canvas
  canvas.addEventListener('mouseenter', function(){ if(!shellOpen) showBadge('Click to Roll!'); });
  canvas.addEventListener('mouseleave', function(){ if(!shellOpen) hideBadge(); });

  window.addEventListener('resize', function(){
    cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });

  renderLoop();
}

function renderLoop(){
  requestAnimationFrame(renderLoop);
  var t = Date.now()*0.001;
  if(!rolling && !shellOpen){
    cube.position.y = Math.sin(t*.7)*.12;
    // smooth mouse follow + idle spin
    var tRX = -mouseNY*.35;
    var tRY = t*.14 + mouseNX*.35;
    cube.rotation.x += (tRX - cube.rotation.x)*.04;
    cube.rotation.y += (tRY - cube.rotation.y)*.04;
    rings.forEach(function(r,i){ r.rotation.z+=.003*(i+1); r.rotation.x+=.001*(i+1); });
    if(halo) halo.rotation.y = t*.05;
  }
  renderer.render(scene,cam);
}

// ── DICE ROLL PHYSICS ─────────────────────────────────
// BoxGeometry face material index → rotation to bring that face toward camera (+Z)
// Face 0 = +X (right side)  → rotate Y = -PI/2
// Face 1 = -X (left side)   → rotate Y = +PI/2
// Face 2 = +Y (top)         → rotate X = +PI/2
// Face 3 = -Y (bottom)      → rotate X = -PI/2
// Face 4 = +Z (front)       → rotate X = 0, Y = 0
// Face 5 = -Z (back)        → rotate Y = PI
var FACE_TARGET_ROT = [
  { x: 0,               y: -Math.PI/2 },
  { x: 0,               y:  Math.PI/2 },
  { x:  Math.PI/2,      y: 0          },
  { x: -Math.PI/2,      y: 0          },
  { x: 0,               y: 0          },
  { x: 0,               y:  Math.PI   }
];

function doRoll(){
  rolling = true;
  var face = Math.floor(Math.random()*6);
  var sec = SECTIONS[face];

  showBadge('🎲 Rolling...');

  var SPINS = 4;
  var target = FACE_TARGET_ROT[face];

  // Current rotation rounded to nearest 2PI, then add spins + face target
  var curX = cube.rotation.x;
  var curY = cube.rotation.y;
  var base2PI = Math.PI*2;
  var toX = (Math.round(curX/base2PI)*base2PI) + (SPINS*base2PI) + target.x;
  var toY = (Math.round(curY/base2PI)*base2PI) + (SPINS*base2PI) + target.y;

  // Animate with requestAnimationFrame (no external library needed!)
  var startTime = null;
  var duration = 2600; // ms
  var startX = curX, startY = curY;

  function easeOut(t){ return 1 - Math.pow(1-t, 4); }

  function animRoll(ts){
    if(!startTime) startTime = ts;
    var elapsed = ts - startTime;
    var progress = Math.min(elapsed/duration, 1);
    var ease = easeOut(progress);

    cube.rotation.x = startX + (toX - startX)*ease;
    cube.rotation.y = startY + (toY - startY)*ease;

    // Scale pulse while rolling
    var s = 1 + Math.sin(elapsed*.025)*0.05;
    cube.scale.set(s,s,s);

    // Highlight landing face
    cube.material.forEach(function(m,i){
      m.emissiveIntensity = (i===face) ? 0.2*progress : 0.04;
    });

    if(progress < 1){
      requestAnimationFrame(animRoll);
    } else {
      // Done rolling
      cube.scale.set(1,1,1);
      cube.material.forEach(function(m,i){ m.emissiveIntensity=(i===face)?0.3:0.02; });
      showBadge('✦ ' + sec.name);

      // Zoom camera in
      var camStart = cam.position.z;
      var camTarget = 1.8;
      var camStart2 = null;
      var camDur = 800;
      function animCam(ts){
        if(!camStart2) camStart2=ts;
        var p = Math.min((ts-camStart2)/camDur,1);
        var e = 1-Math.pow(1-p,3);
        cam.position.z = camStart + (camTarget-camStart)*e;
        cam.updateProjectionMatrix && cam.updateProjectionMatrix();
        if(p<1){ requestAnimationFrame(animCam); }
        else {
          // Wipe then open section
          doWipe(function(){
            openSection(sec.key);
          }, function(){
            rolling=false;
            hideBadge();
            cube.material.forEach(function(m){ m.emissiveIntensity=.05; });
            // Zoom camera back out
            var z0=cam.position.z, zT=5.5, zS=null, zD=700;
            function zoomBack(ts){
              if(!zS)zS=ts;
              var p=Math.min((ts-zS)/zD,1);
              cam.position.z=z0+(zT-z0)*(1-Math.pow(1-p,3));
              if(p<1)requestAnimationFrame(zoomBack);
            }
            requestAnimationFrame(zoomBack);
          });
        }
      }
      requestAnimationFrame(animCam);
    }
  }
  requestAnimationFrame(animRoll);
}

// ── WIPE TRANSITION ───────────────────────────────────
function doWipe(midCb, afterCb){
  var wipe = document.getElementById('WIPE');
  // Slide in from bottom
  wipe.style.transition = 'transform .55s cubic-bezier(.77,0,.175,1)';
  wipe.style.transform = 'scaleY(1)';
  wipe.style.transformOrigin = 'bottom';
  setTimeout(function(){
    midCb();
    // Slide out to top
    wipe.style.transformOrigin = 'top';
    wipe.style.transform = 'scaleY(0)';
    setTimeout(afterCb, 580);
  }, 570);
}

// ── BADGE ─────────────────────────────────────────────
function showBadge(txt){
  var b = document.getElementById('BADGE');
  b.textContent = txt; b.classList.add('v');
}
function hideBadge(){
  document.getElementById('BADGE').classList.remove('v');
}

// ── SECTION MANAGEMENT ────────────────────────────────
function openSection(key){
  shellOpen = true;
  // Make dice canvas non-interactive
  document.getElementById('DC').style.pointerEvents = 'none';

  // Hide all pages
  var pages = document.querySelectorAll('.pg');
  pages.forEach(function(p){ p.classList.remove('on'); });

  // Deactivate all nav buttons
  var navBtns = document.querySelectorAll('.snav-btn');
  navBtns.forEach(function(b){ b.classList.remove('on'); });

  // Show target page
  var pg = document.getElementById('pg-'+key);
  if(pg){ pg.classList.add('on'); }

  // Activate nav button
  var nb = document.getElementById('snb-'+key);
  if(nb){ nb.classList.add('on'); }

  // Show shell
  var shell = document.getElementById('SHELL');
  shell.classList.add('open');
  shell.scrollTop = 0;

  // Section-specific animations
  if(key==='skills')   { setTimeout(animSkills,   400); }
  if(key==='about')    { setTimeout(animCounters, 400); }
}

function closeSection(){
  doWipe(function(){
    var shell = document.getElementById('SHELL');
    shell.classList.remove('open');
    shellOpen = false;
    document.getElementById('DC').style.pointerEvents = 'all';
    // Reset dice materials
    if(cube){ cube.material.forEach(function(m){ m.emissiveIntensity=.05; }); }
  }, function(){});
}

// ── SKILL BAR ANIMATION ───────────────────────────────
function animSkills(){
  document.querySelectorAll('.sk-fill').forEach(function(bar, i){
    setTimeout(function(){ bar.style.width = bar.getAttribute('data-w')+'%'; }, i*130);
  });
}

// ── COUNTER ANIMATION ─────────────────────────────────
var counters = [
  { el: document.getElementById('cnt1'), target:50, suffix:'+' },
  { el: document.getElementById('cnt2'), target:30, suffix:'+' },
  { el: document.getElementById('cnt3'), target:5,  suffix:'+' }
];
function animCounters(){
  counters.forEach(function(c){
    var n=0, step=c.target/50;
    var iv = setInterval(function(){
      n = Math.min(n+step, c.target);
      c.el.textContent = Math.round(n) + (n>=c.target ? c.suffix : '');
      if(n>=c.target) clearInterval(iv);
    }, 28);
  });
}

// ── WIRE UP ALL BUTTONS ───────────────────────────────
// Landing nav buttons
document.getElementById('tnb-about').addEventListener('click',    function(){ doWipe(function(){openSection('about');},function(){}); });
document.getElementById('tnb-projects').addEventListener('click',  function(){ doWipe(function(){openSection('projects');},function(){}); });
document.getElementById('tnb-contact').addEventListener('click',   function(){ doWipe(function(){openSection('contact');},function(){}); });

// Shell nav buttons
document.getElementById('snb-about').addEventListener('click',      function(){ switchSection('about'); });
document.getElementById('snb-projects').addEventListener('click',   function(){ switchSection('projects'); });
document.getElementById('snb-services').addEventListener('click',   function(){ switchSection('services'); });
document.getElementById('snb-blog').addEventListener('click',       function(){ switchSection('blog'); });
document.getElementById('snb-skills').addEventListener('click',     function(){ switchSection('skills'); });
document.getElementById('snb-experience').addEventListener('click', function(){ switchSection('experience'); });
document.getElementById('snb-contact').addEventListener('click',    function(){ switchSection('contact'); });
document.getElementById('snb-resume').addEventListener('click',     function(){ switchSection('resume'); });

// Back button
document.getElementById('backBtn').addEventListener('click', function(){ closeSection(); });

function switchSection(key){
  // Switch pages inside shell without closing
  document.querySelectorAll('.pg').forEach(function(p){ p.classList.remove('on'); });
  document.querySelectorAll('.snav-btn').forEach(function(b){ b.classList.remove('on'); });
  var pg = document.getElementById('pg-'+key);
  if(pg){ pg.classList.add('on'); document.getElementById('SHELL').scrollTop=0; }
  var nb = document.getElementById('snb-'+key);
  if(nb){ nb.classList.add('on'); }
  if(key==='skills')   { setTimeout(animSkills,400); }
  if(key==='about')    { setTimeout(animCounters,400); }
}

// ── KEYBOARD ──────────────────────────────────────────
document.addEventListener('keydown', function(e){
  if(e.key===' ' && !shellOpen){ e.preventDefault(); if(!rolling) doRoll(); }
  if(e.key==='Escape' && shellOpen){ closeSection(); }
});

// ── INIT ──────────────────────────────────────────────
initDice();