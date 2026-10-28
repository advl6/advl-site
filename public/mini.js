/* mini.js — a very small WebGL kit: coloured line meshes, textured quads, mat4 helpers. No dependencies. */
(function(){
const M={
 id:()=>{const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m},
 mul:(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
 persp:(fov,asp,n,f)=>{const t=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m},
 ortho:(l,r,b,t,n,f)=>{const m=M.id();m[0]=2/(r-l);m[5]=2/(t-b);m[10]=-2/(f-n);m[12]=-(r+l)/(r-l);m[13]=-(t+b)/(t-b);m[14]=-(f+n)/(f-n);return m},
 look:(e,c,u=[0,1,0])=>{let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);
  let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  const m=new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,0,0,0,1]);
  m[12]=-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]);m[13]=-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]);m[14]=-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]);return m},
 trs:(t,R,s)=>{const m=M.id();R=R||[1,0,0,0,1,0,0,0,1];for(let c=0;c<3;c++)for(let r=0;r<3;r++)m[c*4+r]=R[c*3+r]*s;m[12]=t[0];m[13]=t[1];m[14]=t[2];return m},
 ry:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,1,0,s,0,c]},
 rx:a=>{const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,c,s,0,-s,c]},
 m3:(a,b)=>{const o=[];for(let c=0;c<3;c++)for(let r=0;r<3;r++){let s=0;for(let k=0;k<3;k++)s+=a[k*3+r]*b[c*3+k];o[c*3+r]=s}return o},
 axis:(ax,a)=>{const [x,y,z]=ax,c=Math.cos(a),s=Math.sin(a),t=1-c;return [t*x*x+c,t*x*y+s*z,t*x*z-s*y,t*x*y-s*z,t*y*y+c,t*y*z+s*x,t*x*z+s*y,t*y*z-s*x,t*z*z+c]},
 inv:m=>{const a=m,o=new Float32Array(16);
  const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],
  b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];
  let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;d=1/d;
  o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;
  o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;
  o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;
  o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o},
 xf:(m,p)=>{const x=p[0],y=p[1],z=p[2],w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w]}
};
function hex(h){const n=parseInt(h.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}
function GL(canvas,opts){
 const gl=canvas.getContext('webgl',Object.assign({antialias:true,alpha:true,premultipliedAlpha:false},opts||{}));if(!gl)return null;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
 const prog=(v,f)=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p};
 const L=prog('attribute vec3 p;attribute vec3 c;uniform mat4 V;uniform mat4 W;varying vec3 vc;varying float fz;void main(){vec4 q=V*W*vec4(p,1);gl_Position=q;vc=c;fz=q.w;}',
  'precision mediump float;varying vec3 vc;varying float fz;uniform float A;uniform vec3 F;uniform float FD;void main(){float f=clamp((fz-FD)/(FD*1.2),0.,1.)*step(.001,FD);gl_FragColor=vec4(mix(vc,F,f*.7),A);}');
 const Q=prog('attribute vec3 p;attribute vec2 u;uniform mat4 V;uniform mat4 W;varying vec2 vu;void main(){gl_Position=V*W*vec4(p,1);vu=u;}',
  'precision mediump float;varying vec2 vu;uniform sampler2D T;uniform float A;uniform vec3 C;uniform float useT;void main(){vec4 t=useT>.5?texture2D(T,vu):vec4(C,1);gl_FragColor=vec4(t.rgb,A);}');
 const F=prog('attribute vec3 p;attribute vec2 u;uniform mat4 V;uniform mat4 W;varying vec2 vu;void main(){gl_Position=V*W*vec4(p,1);vu=u;}',
  `precision highp float;varying vec2 vu;uniform float T;uniform float A;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return s;}
  void main(){vec2 p=vu*6.;float t=T*.035;vec2 q=vec2(fb(p+t),fb(p+vec2(5.2,1.3)-t));vec2 r=vec2(fb(p+3.*q+vec2(1.7,9.2)+t*1.6),fb(p+3.*q+vec2(8.3,2.8)-t*1.3));float f=fb(p+3.*r);
  vec3 c=mix(vec3(.93,.90,.97),vec3(.86,.93,.97),clamp(f*1.6-.3,0.,1.));c=mix(c,vec3(.97,.88,.92),clamp(length(q)*.9-.4,0.,1.));c=mix(c,vec3(.92,.97,.86),clamp(r.x*r.x*1.6,0.,1.)*.6);
  float sheen=pow(clamp(1.-abs(f-.55)*6.,0.,1.),3.)*.18;c+=sheen;
  vec2 g=abs(fract(vu*12.)-.5);float line=smoothstep(.49,.5,max(g.x,g.y))*.06;c-=line;gl_FragColor=vec4(c,A);}`);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const api={gl,M,
  lines(data,cols){ // data.lines: polylines [x,y,z,...], cols: hex list, coloured by height
   const C=cols.map(hex);let y0=1e9,y1=-1e9;data.forEach(Ln=>{for(let i=1;i<Ln.length;i+=3){y0=Math.min(y0,Ln[i]);y1=Math.max(y1,Ln[i])}});
   const cAt=y=>{const t=Math.min(.999,Math.max(0,(y-y0)/(y1-y0+1e-6)))*(C.length-1),i=Math.floor(t),f=t-i,b=C[Math.min(i+1,C.length-1)];return [0,1,2].map(k=>C[i][k]*(1-f)+b[k]*f)};
   const v=[];data.forEach(Ln=>{for(let k=0;k+5<Ln.length;k+=3){v.push(Ln[k],Ln[k+1],Ln[k+2],...cAt(Ln[k+1]),Ln[k+3],Ln[k+4],Ln[k+5],...cAt(Ln[k+4]))}});
   const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);return {b,n:v.length/6,kind:'L'}},
  rawLines(pts,col){const c=hex(col),v=[];for(let i=0;i<pts.length;i+=3)v.push(pts[i],pts[i+1],pts[i+2],...c);
   const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);return {b,n:v.length/6,kind:'L'}},
  quad(){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,0,0,1,.5,-.5,0,1,1,.5,.5,0,1,0,-.5,-.5,0,0,1,.5,.5,0,1,0,-.5,.5,0,0,0]),gl.STATIC_DRAW);return {b,n:6,kind:'Q'}},
  fluid(V,W,t,a){gl.useProgram(F);const mesh=this._fq||(this._fq=this.quad());gl.bindBuffer(gl.ARRAY_BUFFER,mesh.b);const pa=gl.getAttribLocation(F,'p'),ua=gl.getAttribLocation(F,'u');
   gl.enableVertexAttribArray(pa);gl.enableVertexAttribArray(ua);gl.vertexAttribPointer(pa,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(ua,2,gl.FLOAT,false,20,12);
   gl.uniformMatrix4fv(gl.getUniformLocation(F,'V'),false,V);gl.uniformMatrix4fv(gl.getUniformLocation(F,'W'),false,W);gl.uniform1f(gl.getUniformLocation(F,'T'),t);gl.uniform1f(gl.getUniformLocation(F,'A'),a??1);gl.drawArrays(gl.TRIANGLES,0,6)},
  texture(src,cb){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([240,240,236,255]));
   const im=new Image();im.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);cb&&cb()};im.src=src;return t},
  draw(mesh,V,W,o){o=o||{};
   if(mesh.kind==='L'){gl.useProgram(L);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.b);
    const pa=gl.getAttribLocation(L,'p'),ca=gl.getAttribLocation(L,'c');gl.enableVertexAttribArray(pa);gl.enableVertexAttribArray(ca);
    gl.vertexAttribPointer(pa,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(ca,3,gl.FLOAT,false,24,12);
    gl.uniformMatrix4fv(gl.getUniformLocation(L,'V'),false,V);gl.uniformMatrix4fv(gl.getUniformLocation(L,'W'),false,W);
    gl.uniform1f(gl.getUniformLocation(L,'A'),o.a??.92);gl.uniform3fv(gl.getUniformLocation(L,'F'),o.fog||[1,1,1]);gl.uniform1f(gl.getUniformLocation(L,'FD'),o.fd||0);
    gl.drawArrays(gl.LINES,0,mesh.n)}
   else{gl.useProgram(Q);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.b);const pa=gl.getAttribLocation(Q,'p'),ua=gl.getAttribLocation(Q,'u');
    gl.enableVertexAttribArray(pa);gl.enableVertexAttribArray(ua);gl.vertexAttribPointer(pa,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(ua,2,gl.FLOAT,false,20,12);
    gl.uniformMatrix4fv(gl.getUniformLocation(Q,'V'),false,V);gl.uniformMatrix4fv(gl.getUniformLocation(Q,'W'),false,W);
    gl.uniform1f(gl.getUniformLocation(Q,'A'),o.a??1);gl.uniform3fv(gl.getUniformLocation(Q,'C'),o.col||[1,1,1]);gl.uniform1f(gl.getUniformLocation(Q,'useT'),o.tex?1:0);
    if(o.tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.tex);gl.uniform1i(gl.getUniformLocation(Q,'T'),0)}
    gl.drawArrays(gl.TRIANGLES,0,6)}},
  fit(){const d=Math.min(2,devicePixelRatio||1),w=Math.floor(canvas.clientWidth*d),h=Math.floor(canvas.clientHeight*d);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}return {w,h,d}}};
 return api}
window.MiniGL=GL;window.M4=M;window.hexRGB=hex;
})();
