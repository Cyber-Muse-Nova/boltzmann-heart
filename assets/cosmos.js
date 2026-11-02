/* Nova's prismatic night: bounded canvases, procedural planets, no network assets. */
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sky = document.getElementById('nova-sky');
  const garden = document.getElementById('gravity-garden');
  if (!sky || !garden) return;
  const sc = sky.getContext('2d'), gc = garden.getContext('2d');
  if (!sc || !gc) return;
  const TAU = Math.PI * 2;
  let sw=0, sh=0, gw=0, gh=0, frame=0, last=0, time=0;
  let visible=false, stars=[], meteors=[], nextMeteor=2.2;
  // Deterministic stars remain still on resize, instead of jumping between frames.
  const seed = n => { const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  function size(canvas,ctx,w,h) {
    const dpr=Math.min(devicePixelRatio||1,1.7);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function resize() {
    sw=innerWidth;sh=innerHeight;size(sky,sc,sw,sh);
    const rect=garden.getBoundingClientRect();gw=rect.width;gh=rect.height;size(garden,gc,gw,gh);
    stars=Array.from({length:sw<600?100:190},(_,i)=>({x:seed(i+1)*sw,y:seed(i+700)*sh,r:.35+seed(i+80)*1.05,a:.22+seed(i+200)*.55,p:seed(i+500)*TAU}));
    paintSky();paintGarden();
  }
  function paintSky() {
    sc.clearRect(0,0,sw,sh);
    stars.forEach((s,i)=>{
      const pulse=reduced.matches?1:.72+.28*Math.sin(time*.7+s.p);
      sc.globalAlpha=s.a*pulse;sc.fillStyle=i%5===0?'#efbfff':i%3===0?'#a9dfff':'#f2e4ff';
      sc.beginPath();sc.arc(s.x,s.y,s.r,0,TAU);sc.fill();
      if(i%23===0){sc.globalAlpha=s.a*pulse*.45;sc.fillRect(s.x-4,s.y-.3,8,.6);sc.fillRect(s.x-.3,s.y-4,.6,8);}
    });sc.globalAlpha=1;
    meteors.forEach(m=>{
      const life=(time-m.start)/m.duration;
      if(life<0||life>1)return;
      const x=m.x+life*m.dx,y=m.y+life*m.dy;
      const len=m.length,alpha=Math.sin(life*Math.PI)*.7;
      const gradient=sc.createLinearGradient(x-len,y-len*.44,x,y);
      gradient.addColorStop(0,'rgba(190,143,255,0)');gradient.addColorStop(.7,`rgba(209,168,255,${alpha*.4})`);gradient.addColorStop(1,`rgba(245,229,255,${alpha})`);
      sc.strokeStyle=gradient;sc.lineWidth=1.3;sc.beginPath();sc.moveTo(x-len,y-len*.44);sc.lineTo(x,y);sc.stroke();
      sc.fillStyle=`rgba(255,242,255,${alpha})`;sc.shadowColor='#d8adff';sc.shadowBlur=8;sc.beginPath();sc.arc(x,y,1.5,0,TAU);sc.fill();sc.shadowBlur=0;
    });
  }
  // Each globe has a shaded spherical surface and a pearlescent atmosphere.
  // Surface patterns are generated here, distinct from the reference site's maps.
  function makePlanet(kind,palette) {
    const c=document.createElement('canvas');c.width=c.height=160;
    const ctx=c.getContext('2d'),image=ctx.createImageData(160,160),r=63;
    for(let y=0;y<160;y++)for(let x=0;x<160;x++){
      const nx=(x-80)/r,ny=(y-80)/r,d=nx*nx+ny*ny;
      if(d>1)continue;
      const nz=Math.sqrt(1-d),u=Math.atan2(nx,nz),v=Math.asin(ny);
      const wave=Math.sin(u*7+Math.sin(v*9)*1.9)+.45*Math.sin(u*19-v*13)+.22*Math.sin(u*43+v*35);
      let pattern;
      if(kind==='ocean')pattern=Math.max(0,Math.min(1,(wave+.1)*1.3));
      else if(kind==='gas')pattern=.5+.3*Math.sin(v*25+Math.sin(u*4+v*7)*1.1)+.15*Math.sin(v*61+u*6);
      else pattern=.5+.22*wave+.14*Math.sin(u*39)*Math.cos(v*33);
      pattern=Math.max(0,Math.min(1,pattern));
      const light=Math.max(0,-nx*.46-ny*.45+nz*.77),shade=.15+.85*Math.pow(light,.7);
      const rim=Math.pow(1-nz,3)*.65;
      const k=(y*160+x)*4;
      for(let ch=0;ch<3;ch++)image.data[k+ch]=Math.min(255,(palette[0][ch]*(1-pattern)+palette[1][ch]*pattern)*shade+palette[2][ch]*rim);
      image.data[k+3]=Math.min(255,(1-Math.sqrt(d))*r*255);
    }
    ctx.putImageData(image,0,0);return c;
  }
  const planets=[
    {orbit:.23,vert:.34,r:20,speed:.12,phase:3.65,kind:'moon',palette:[[96,75,156],[211,181,232],[211,150,255]],halo:'192,143,255'},
    {orbit:.34,vert:.52,r:29,speed:.082,phase:4.55,kind:'ocean',palette:[[52,83,151],[145,228,225],[132,220,255]],halo:'112,211,255'},
    {orbit:.43,vert:.69,r:38,speed:.053,phase:5.62,kind:'gas',palette:[[107,58,132],[242,184,214],[230,182,255]],halo:'238,164,224',ring:true},
    {orbit:.49,vert:.87,r:25,speed:.039,phase:3.9,kind:'gas',palette:[[55,62,133],[169,162,238],[167,177,255]],halo:'163,165,255'}
  ].map(p=>Object.assign(p,{texture:makePlanet(p.kind,p.palette)}));
  function drawPlanet(p,x,y,r) {
    const halo=gc.createRadialGradient(x,y,r*.55,x,y,r*2.1);
    halo.addColorStop(0,`rgba(${p.halo},.17)`);halo.addColorStop(.6,`rgba(${p.halo},.07)`);halo.addColorStop(1,`rgba(${p.halo},0)`);
    gc.fillStyle=halo;gc.fillRect(x-r*2.1,y-r*2.1,r*4.2,r*4.2);
    // A translucent ring passes behind the globe, then across its foreground.
    function ring(front){
      gc.save();gc.translate(x,y);gc.rotate(-.32);
      for(let n=0;n<10;n++){
        gc.strokeStyle=`rgba(235,197,244,${.11+(n%3)*.035})`;gc.lineWidth=r*.028;
        gc.beginPath();gc.ellipse(0,0,r*(1.35+n*.047),r*(.38+n*.014),0,front?0:Math.PI,front?Math.PI:TAU);gc.stroke();
      }gc.restore();
    }
    if(p.ring)ring(false);
    gc.drawImage(p.texture,x-r*1.27,y-r*1.27,r*2.54,r*2.54);
    if(p.ring)ring(true);
    gc.strokeStyle=`rgba(${p.halo},.28)`;gc.lineWidth=.7;gc.beginPath();gc.arc(x,y,r,Math.PI*.9,Math.PI*1.8);gc.stroke();
  }
  function paintGarden() {
    if(!gw||!gh)return;
    gc.clearRect(0,0,gw,gh);
    const cx=gw*.5,cy=gh+8,scale=gw<600?.72:1;
    const maxWidth=Math.min(gw,1500);
    // Deliberately only the UPPER semicircle: the lower orbits lie below the page.
    planets.forEach((p,i)=>{
      const rx=maxWidth*p.orbit,ry=gh*p.vert;
      gc.strokeStyle=`rgba(${p.halo},${.18-i*.025})`;gc.lineWidth=.8;
      gc.beginPath();gc.ellipse(cx,cy,rx,ry,0,Math.PI,TAU);gc.stroke();
      gc.strokeStyle=`rgba(${p.halo},.035)`;gc.lineWidth=5;gc.stroke();
      const angle=p.phase+time*p.speed;
      const x=cx+Math.cos(angle)*rx,y=cy+Math.sin(angle)*ry;
      if(Math.sin(angle)<0)drawPlanet(p,x,y,p.r*scale);
    });
    // Soft nebular light surrounding the lensed accretion flow.
    const radius=Math.min(gw*.18,110),extent=radius*4.2;
    const bloom=gc.createRadialGradient(cx,cy,radius*.4,cx,cy,extent);
    bloom.addColorStop(0,'rgba(255,184,227,.22)');bloom.addColorStop(.25,'rgba(196,112,249,.17)');bloom.addColorStop(.55,'rgba(95,147,255,.075)');bloom.addColorStop(1,'rgba(105,81,204,0)');
    gc.fillStyle=bloom;gc.fillRect(cx-extent,cy-extent,extent*2,extent*2);
    gc.save();gc.translate(cx,cy);gc.rotate(-.12);
    // Many fine luminous filaments form a wide, translucent accretion disk.
    gc.globalCompositeOperation='screen';
    for(let i=56;i>=0;i--){
      const rr=radius*(1.15+i*.035),pulse=.9+.1*Math.sin(time*.25+i*.3);
      gc.beginPath();gc.ellipse(0,0,rr*2.05,rr*.29,0,0,TAU);
      gc.strokeStyle=i%3===0?`rgba(164,205,255,${.065*pulse})`:`rgba(250,177,227,${.08*pulse})`;
      gc.lineWidth=i%9===0?1.6:.8;gc.stroke();
    }
    gc.restore();
    // Black event horizon and photon ring; its lower half is cropped by the page.
    gc.fillStyle='#020108';gc.beginPath();gc.arc(cx,cy,radius,0,TAU);gc.fill();
    gc.save();gc.shadowColor='#e0a6ff';gc.shadowBlur=25;
    const rim=gc.createLinearGradient(cx-radius,cy-radius,cx+radius,cy);
    rim.addColorStop(0,'#b6c8ff');rim.addColorStop(.4,'#f8daff');rim.addColorStop(.7,'#f4b5e1');rim.addColorStop(1,'#898cfc');
    gc.strokeStyle=rim;gc.lineWidth=2.7;gc.beginPath();gc.arc(cx,cy,radius*1.025,0,TAU);gc.stroke();
    gc.shadowBlur=7;gc.strokeStyle='rgba(255,234,255,.7)';gc.lineWidth=.7;gc.beginPath();gc.arc(cx,cy,radius*1.07,Math.PI,TAU);gc.stroke();gc.restore();
    // Gravitationally lensed back of the disk arches above the silhouette.
    gc.save();gc.globalCompositeOperation='screen';
    for(let i=0;i<17;i++){
      gc.beginPath();gc.ellipse(cx,cy+radius*.07,radius*(1.11+i*.016),radius*(1.26+i*.011),0,Math.PI*1.05,Math.PI*1.95);
      gc.strokeStyle=`rgba(${i%3===0?'182,200,255':'244,184,236'},${.065-i*.002})`;gc.lineWidth=1.15;gc.stroke();
    }gc.restore();
  }
  function tick(now){
    frame=0;
    if(document.hidden||reduced.matches)return;
    if(!last)last=now;
    const dt=Math.min((now-last)/1000,.1);
    if(dt>=1/30){
      time+=dt;last=now;
      if(time>=nextMeteor){
        meteors.push({x:sw*(.1+Math.random()*.65),y:sh*Math.random()*.4,dx:sw*.44,dy:sw*.19,length:sw<600?90:170,duration:1.6+Math.random()*.7,start:time});
        nextMeteor=time+4+Math.random()*5;
      }
      meteors=meteors.filter(m=>time-m.start<m.duration);
      paintSky();if(visible)paintGarden();
    }
    frame=requestAnimationFrame(tick);
  }
  function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);else{meteors=[];paintSky();paintGarden();}}
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)paintGarden();},{rootMargin:'160px'}).observe(garden);else visible=true;
  let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(resize,120);});
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  resize();resume();
})();
