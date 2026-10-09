(() => {
  'use strict';
  const stars = [...document.querySelectorAll('.star')];
  const found = new Set();
  const secrets = [
    { title: 'A softer kind of gravity.', body: 'Some people pull you closer without ever asking you to move. You do that.', name: 'THE PULL' },
    { title: 'My favorite little orbit.', body: 'If every thought of you became a star, there wouldn’t be any darkness left.', name: 'THE LIGHT' },
    { title: 'Something that stays.', body: 'Real flowers fade. So I made these a tiny universe where they never have to.', name: 'THE PROMISE' }
  ];
  const title = document.querySelector('#headline');
  const initialTitle = title.innerHTML;
  const intro = document.querySelector('.intro');
  const initialIntro = intro.innerHTML;
  const note = document.querySelector('.secret');
  const label = document.querySelector('.secret-label');
  const noteTitle = document.querySelector('.secret-title');
  const noteBody = document.querySelector('.secret-body');
  const status = document.querySelector('#announcement');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function showNote(heading, body, eyebrow) {
    label.textContent = eyebrow;
    noteTitle.textContent = heading;
    noteBody.textContent = body;
    note.classList.remove('reveal');
    void note.offsetWidth;
    note.classList.add('reveal');
  }
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      const isNew = !found.has(index);
      found.add(index);
      star.setAttribute('aria-pressed', 'true');
      document.querySelectorAll('.progress i')[index].classList.add('found');
      document.querySelector('#count').textContent = `${found.size} / 3 little secrets`;
      const secret = secrets[index];
      showNote(secret.title, secret.body, `SECRET 0${index + 1} / ${secret.name}`);
      status.textContent = `${secret.title} ${secret.body} ${found.size} of 3 secrets found.`;
      if (isNew) shower(found.size === 3 ? 30 : 9);
      if (found.size === 3 && !document.body.classList.contains('complete')) {
        document.body.classList.add('complete');
        title.innerHTML = '<span>A whole universe.</span><em>Still, you.</em>';
        intro.textContent = 'All those stars. All those possibilities. And I’d still pick you, every single time.';
        document.querySelector('.invitation-text').textContent = 'You were the surprise all along.';
        document.querySelector('.orbital-caption').textContent = 'EVERY ORBIT LEADS BACK TO YOU';
        status.textContent += ' A whole universe. Still, you. You were the surprise all along.';
      }
      if (matchMedia('(max-width: 700px)').matches) {
        note.scrollIntoView({block: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth'});
      }
    });
  });

  document.querySelector('#restart').addEventListener('click', () => {
    found.clear();
    document.body.classList.remove('complete');
    stars.forEach(star => star.setAttribute('aria-pressed', 'false'));
    document.querySelectorAll('.progress i').forEach(dot => dot.classList.remove('found'));
    document.querySelector('#count').textContent = '0 / 3 little secrets';
    title.innerHTML = initialTitle;
    intro.innerHTML = initialIntro;
    document.querySelector('.invitation-text').textContent = 'Touch the three stars. They’re keeping secrets.';
    document.querySelector('.orbital-caption').textContent = 'A SMALL WORLD. AN UNREASONABLE AMOUNT OF LOVE.';
    showNote('Some things are worth finding.', 'There are three little things I left in the sky for you.', 'A NOTE FROM THIS UNIVERSE');
    const flowers = document.querySelector('.flowers');
    flowers.replaceWith(flowers.cloneNode(true));
    status.textContent = 'Your little universe has started over. Three secrets to find.';
  });
  document.querySelector('#magic').addEventListener('click', () => {
    shower(24);
    status.textContent = reducedMotion.matches ? 'A little extra starlight, just for you.' : 'A shower of stardust, just for you.';
  });

  // Tiny local canvas effect; no images, network calls, audio, or tracking.
  const canvas = document.querySelector('#stardust');
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, particles = [], sky = [], frame = 0, last = 0;
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    sky = Array.from({length: Math.min(100, Math.round(width * height / 11500))}, () => ({x: Math.random()*width, y:Math.random()*height, r:Math.random()*.9+.3, phase:Math.random()*6.28}));
    if (reducedMotion.matches) draw(0);
  }
  function shower(amount) {
    if (!ctx) return;
    if (reducedMotion.matches) {
      draw(0);
      for (let i=0; i<18; i++) { ctx.fillStyle='#ffe7ba99'; ctx.fillRect(Math.random()*width,Math.random()*height,2,2); }
      return;
    }
    for (let i=0;i<amount;i++) particles.push({x:Math.random()*width,y:Math.random()*height*.6-100,vx:1.8+Math.random()*2,vy:2+Math.random()*3,life:0,max:70+Math.random()*60,delay:Math.random()*45});
    particles = particles.slice(-90);
  }
  function draw(time) {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    for(const point of sky) {
      const alpha = .18 + (Math.sin(time*.0006+point.phase)+1)*.17;
      ctx.beginPath(); ctx.fillStyle=`rgba(250,214,233,${alpha})`; ctx.arc(point.x,point.y,point.r,0,Math.PI*2); ctx.fill();
    }
    const dt = Math.min((time-last)/16.67 || 1, 2); last = time;
    for(const p of particles) {
      if(p.delay>0){p.delay-=dt;continue;}
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.life+=dt;
      const alpha = Math.max(0,Math.sin(Math.PI*p.life/p.max))*.7;
      const tail = ctx.createLinearGradient(p.x-p.vx*12,p.y-p.vy*12,p.x,p.y);
      tail.addColorStop(0,'rgba(255,215,208,0)');tail.addColorStop(1,`rgba(255,229,189,${alpha})`);
      ctx.beginPath();ctx.strokeStyle=tail;ctx.lineWidth=1.2;ctx.moveTo(p.x-p.vx*12,p.y-p.vy*12);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
    particles=particles.filter(p=>p.life<p.max);
  }
  function tick(time) { draw(time); frame=requestAnimationFrame(tick); }
  function motion() { cancelAnimationFrame(frame); last=0; if(ctx&&!document.hidden&&!reducedMotion.matches) frame=requestAnimationFrame(tick); else draw(0); }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange',motion);
  reducedMotion.addEventListener('change',motion);
  resize(); motion();
  document.body.classList.remove('container');
})();
