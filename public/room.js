window.ROOM=function(el,DATA){const M=M4,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;let view='room',run=false;const loops=[];
 const tag=document.createElement('div');tag.className='rtag';document.body.appendChild(tag);
 const setTag=(t,x,y)=>{if(!t){tag.style.opacity=0;return}tag.textContent=t;tag.style.left=x+'px';tag.style.top=y+'px';tag.style.opacity=1};
 {const cv=document.createElement('canvas');el.appendChild(cv);const G=this.G=MiniGL(cv,{alpha:true});if(!G)return;
 const RW=12,RD=12,RH=5.2,quad=G.quad(),tex=[0,1,2,3].map(i=>G.texture(`frost/mural${i}.webp`));
 const walls=[];const wall=(w,pos,ry,n,k)=>{walls.push({W:M.trs(pos,M.ry(ry),1),w,n,k,fade:1})};
 wall(RW,[0,RH/2,-RD/2],0,[0,0,1],0);wall(RD,[-RW/2,RH/2,0],Math.PI/2,[1,0,0],1);wall(RD,[RW/2,RH/2,0],-Math.PI/2,[-1,0,0],2);wall(RW,[0,RH/2,RD/2],Math.PI,[0,0,-1],3);
 let still=false;const ob=document.createElement('button');ob.type='button';ob.className='obs';ob.setAttribute('aria-pressed','false');ob.textContent='Observe';
 ob.onclick=()=>{still=!still;ob.setAttribute('aria-pressed',String(still));ob.textContent=still?'Observing':'Observe';held=null};el.appendChild(ob);const mb=document.createElement('button');mb.type='button';mb.className='obs mdl';mb.textContent='3D models';mb.onclick=()=>el.dispatchEvent(new CustomEvent('advl:artifact',{bubbles:true,detail:null}));el.appendChild(mb);
 const gp=[];for(let i=-6;i<=6;i++)gp.push(i,.002,-6,i,.002,6,-6,.002,i,6,.002,i);const grid=G.rawLines(gp,'#DCDCD5');
 const B=this.B=DATA.map(o=>{const s=Math.max(.6,Math.min(2.6,o.mm/700));
  return {o,mesh:G.lines(o.lines,o.col),s,h:o.ext[1]*s,r:Math.max(.25,Math.hypot(o.ext[0],o.ext[2])*s*.4),roll:['04','13','14'].includes(o.num),flt:o.float,
   p:[(Math.random()-.5)*8,o.float?2.2+Math.random():2.5+Math.random()*4,(Math.random()-.5)*8],v:[0,0,0],R:[1,0,0,0,1,0,0,0,1],yaw:Math.random()*6}});
 const orb={a:.6,e:.32,d:13.5};let t=0,VP=null,held=null,drag=null;
 const scr=p=>{const q=M.xf(VP,p);return [(q[0]+1)/2*cv.clientWidth,(1-q[1])/2*cv.clientHeight,q[2]]};
 const near=(x,y)=>{let best=null,bd=1e9;B.forEach(b=>{const c=scr([b.p[0],b.p[1]+b.h/2,b.p[2]]);const top=scr([b.p[0],b.p[1]+b.h,b.p[2]]);
   const rad=Math.max(28,Math.abs(c[1]-top[1]));const dd=Math.hypot(c[0]-x,c[1]-y);if(dd<rad&&dd<bd&&c[2]<1){bd=dd;best=b}});return best};
 const floorAt=(x,y,yy)=>{const I=M.inv(VP),nx=x/cv.clientWidth*2-1,ny=1-y/cv.clientHeight*2,a=M.xf(I,[nx,ny,-1]),b=M.xf(I,[nx,ny,1]);
   const tt=(yy-a[1])/(b[1]-a[1]);return [a[0]+(b[0]-a[0])*tt,yy,a[2]+(b[2]-a[2])*tt]};
 let tap=null;cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const r=cv.getBoundingClientRect();const hit=near(e.clientX-r.left,e.clientY-r.top);tap=hit?{b:hit,x:e.clientX,y:e.clientY,t:performance.now()}:null;held=still?null:hit;if(!held)drag={x:e.clientX,y:e.clientY,a:orb.a,e:orb.e}});
 cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(held){const f=floorAt(x,y,Math.max(held.p[1],.6));held.v=[(f[0]-held.p[0])*28,3.5,(f[2]-held.p[2])*28];held.p=[f[0],held.p[1],f[2]];setTag(null)}
  else if(drag){orb.a=drag.a-(e.clientX-drag.x)*.006;orb.e=Math.max(.06,Math.min(1.05,drag.e+(e.clientY-drag.y)*.004))}
  else{const b=near(x,y);setTag(b&&`${b.o.num} ${b.o.name}${b.o.model?' · tap to view in 3D':''}`,e.clientX,e.clientY)}});
 cv.addEventListener('pointerup',e=>{if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<8&&performance.now()-tap.t<350&&tap.b.o.model)el.dispatchEvent(new CustomEvent('advl:artifact',{bubbles:true,detail:tap.b.o}));tap=null;held=null;drag=null});cv.addEventListener('pointerleave',()=>setTag(null));
 loops.push(()=>{if(!run)return;const {w,h}=G.fit(),gl=G.gl;const dt=1/60;t+=dt;
  if(!RM&&!drag)orb.a+=.0007;
  const eye=[Math.sin(orb.a)*Math.cos(orb.e)*orb.d,1.6+Math.sin(orb.e)*orb.d*.8,Math.cos(orb.a)*Math.cos(orb.e)*orb.d];
  VP=M.mul(M.persp(.84,w/h,.1,80),M.look(eye,[0,1.1,0]));
  // physics: gravity + slowly wandering floor tilt; buoyant floaters; wall and pairwise collisions
  const tx=RM?0:Math.sin(t*.17)*1.1+Math.sin(t*.05)*.6,tz=RM?0:Math.cos(t*.13)*1.1,hw=RW/2-.3,hd=RD/2-.3;
  B.forEach(b=>{if(b===held)return;const v=b.v,p=b.p;
   if(b.flt){const tg=2.1+Math.sin(t*.6+b.r*7)*.35;v[1]+=((tg-p[1])*1.6-v[1]*.9)*dt;v[0]+=Math.sin(t*.21+b.r*9)*.35*dt;v[2]+=Math.cos(t*.19+b.r*5)*.35*dt;v[0]*=.995;v[2]*=.995}
   else{v[1]-=9.8*dt;if(p[1]<=.001){v[0]+=tx*dt;v[2]+=tz*dt;const fr=b.roll?.4:1.6;v[0]-=v[0]*fr*dt;v[2]-=v[2]*fr*dt}}
   p[0]+=v[0]*dt;p[1]+=v[1]*dt;p[2]+=v[2]*dt;
   if(p[1]<0){p[1]=0;v[1]=v[1]<-1.5?-v[1]*.32:0}
   if(Math.abs(p[0])>hw-b.r){p[0]=Math.sign(p[0])*(hw-b.r);v[0]*=-.45}if(Math.abs(p[2])>hd-b.r){p[2]=Math.sign(p[2])*(hd-b.r);v[2]*=-.45}});
  for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],c=B[j];if(Math.abs((a.p[1]+a.h/2)-(c.p[1]+c.h/2))>(a.h+c.h)/2)continue;
   const dx=c.p[0]-a.p[0],dz=c.p[2]-a.p[2],d=Math.hypot(dx,dz)||1e-4,m=a.r+c.r;if(d<m){const nx=dx/d,nz=dz/d,pu=(m-d)/2;
    a.p[0]-=nx*pu;a.p[2]-=nz*pu;c.p[0]+=nx*pu;c.p[2]+=nz*pu;const rv=(c.v[0]-a.v[0])*nx+(c.v[2]-a.v[2])*nz;if(rv<0){const J=-.7*rv;a.v[0]-=J*nx;a.v[2]-=J*nz;c.v[0]+=J*nx;c.v[2]+=J*nz}}}
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  {const FW=M.trs([0,0,0],M.rx(-Math.PI/2),1);for(const i of [0,1,2,4,5,6,8,9,10])FW[i]*=12;G.fluid(VP,FW,RM?0:t,1)}
  // walls: the one facing the viewer fades to clear glass; draw opaque ones first
  const ce=[eye[0],0,eye[2]],cl=Math.hypot(ce[0],ce[2]);
  walls.forEach(wl=>{const facing=(wl.n[0]*ce[0]+wl.n[2]*ce[2])/cl;const target=facing<-.35?0:1;wl.fade+=(target-wl.fade)*.06});
  const WM=wl=>{const L=M.id();L[0]=wl.w;L[5]=RH;return M.mul(wl.W,L)};
  walls.filter(wl=>wl.fade>.98).forEach(wl=>G.draw(quad,VP,WM(wl),{tex:tex[wl.k],a:1}));
  gl.depthMask(false);walls.filter(wl=>wl.fade<=.98).forEach(wl=>G.draw(quad,VP,WM(wl),{tex:tex[wl.k],a:.06+.94*wl.fade}));gl.depthMask(true);
  B.forEach(b=>{const sp=Math.hypot(b.v[0],b.v[2]);let R;
   if(b.roll&&sp>.01&&b.p[1]<.01){const ax=[b.v[2]/sp,0,-b.v[0]/sp];b.R=M.m3(M.axis(ax,sp*dt/Math.max(.3,b.h/2)),b.R);R=b.R}
   else{b.yaw+=(b.flt?.12:sp*.05)*dt*3;R=M.ry(b.yaw)}
   const off=b.roll?M.xf(M.trs([0,0,0],R,b.s),[0,b.h/2/b.s,0]):[0,0,0];
   const W=M.trs([b.p[0]+(b.roll?-off[0]:0),b.p[1]+(b.roll?b.h/2-off[1]:0),b.p[2]+(b.roll?-off[2]:0)],R,b.s);
   G.draw(b.mesh,VP,W,{a:.95,fog:[.968,.968,.96],fd:14})})});
}
 (function tick(){requestAnimationFrame(tick);if(run)loops.forEach(f=>f())})();
 return {start(){run=true},stop(){run=false;setTag(null)}};};
