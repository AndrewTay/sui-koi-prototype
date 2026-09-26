import { clamp } from './model.js';
import { KoiMotion, CollectionFlight, pondLayout } from './swimming.js';

const screenVertex = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

const backgroundFragment = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_reveal;
out vec4 color;
void main(){
  vec2 uv=vec2(v_uv.x,1.-v_uv.y);
  float aspect=u_resolution.x/u_resolution.y;
  vec2 scale=vec2(min(aspect/u_imageAspect,1.),min(u_imageAspect/aspect,1.));
  uv=(uv-.5)*scale+.5;
  vec2 texel=1./vec2(textureSize(u_image,0));
  vec3 softened=texture(u_image,uv).rgb*.46;
  softened+=(texture(u_image,uv+vec2(texel.x*3.,0.)).rgb+texture(u_image,uv-vec2(texel.x*3.,0.)).rgb+texture(u_image,uv+vec2(0.,texel.y*3.)).rgb+texture(u_image,uv-vec2(0.,texel.y*3.)).rgb)*.135;
  color=vec4(softened*(1.-u_reveal),1.-u_reveal);
}`;

const fishVertex = `#version 300 es
precision highp float;
in vec2 a_uv;
out vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_spine[25];
uniform float u_length;
uniform float u_beat;
uniform float u_speed;
uniform float u_settle;
uniform vec2 u_offset;
void main(){
  v_uv=a_uv;
  float row=a_uv.y*24.;
  int index=min(int(floor(row)),23);
  vec2 centre=mix(u_spine[index],u_spine[index+1],row-float(index));
  vec2 tangent=normalize(u_spine[min(index+2,24)]-u_spine[max(index-1,0)]+vec2(0.,.00001));
  vec2 side=vec2(tangent.y,-tangent.x);
  float lateral=(a_uv.x-.5)*u_length*(2./3.);
  float finBand=exp(-pow((a_uv.y-.33)*9.,2.));
  lateral*=1.+sin(u_beat*.62)*.065*finBand*(1.-u_settle);
  float tail=pow(a_uv.y,2.6);
  lateral+=sin(u_beat-a_uv.y*5.4)*u_length*(.002+tail*(.018+u_speed*.02))*(1.-u_settle);
  vec2 p=centre+side*lateral+u_offset;
  gl_Position=vec4(p.x/u_resolution.x*2.-1.,1.-p.y/u_resolution.y*2.,0.,1.);
}`;

const fishFragment = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_image;
uniform float u_shadow;
uniform float u_time;
uniform float u_settle;
out vec4 color;
void main(){
  vec4 fish=texture(u_image,v_uv);
  if(fish.a<.008)discard;
  if(u_shadow>.5){color=vec4(.015,.08,.065,fish.a*.20*(1.-u_settle));return;}
  vec3 lit=fish.rgb*mix(vec3(.84,.9,.83),vec3(1.),u_settle);
  float light=pow(max(0.,sin(v_uv.x*16.+v_uv.y*19.+u_time*.6)),16.);
  lit+=vec3(.07,.095,.06)*light*(1.-u_settle);
  color=vec4(lit,fish.a);
}`;

const waterFragment = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_scene;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_ripples[16];
uniform float u_settle;
out vec4 color;
void main(){
  vec2 p=vec2(v_uv.x,1.-v_uv.y)*u_resolution;
  vec2 q=p/max(u_resolution.y,1.);
  float t=u_time;
  vec2 shift=vec2(sin(q.y*23.+t*.45)+sin(q.y*11.-q.x*9.+t*.27),cos(q.x*21.+t*.32)+sin(q.y*16.+q.x*7.-t*.31))*.52;
  float foam=0.;
  for(int i=0;i<16;i++){
    float age=t-u_ripples[i].z;
    if(age<0.||age>4.||u_ripples[i].w<=0.)continue;
    vec2 delta=p-u_ripples[i].xy;
    float dist=length(delta);
    float radius=age*95.;
    float band=exp(-pow((dist-radius)/24.,2.));
    float fade=exp(-age*.95)*u_ripples[i].w;
    float wave=cos((dist-radius)*.17);
    shift+=delta/max(dist,1.)*band*wave*fade*5.;
    foam+=band*wave*fade*.035;
  }
  float field=smoothstep(.01,.22,v_uv.x)*smoothstep(.0,.18,1.-v_uv.x)*smoothstep(.0,.16,v_uv.y)*smoothstep(.0,.12,1.-v_uv.y);
  vec2 uv=clamp(v_uv+vec2(shift.x,-shift.y)*field*(1.-u_settle)/u_resolution,vec2(.001),vec2(.999));
  vec4 scene=texture(u_scene,uv);
  scene.rgb+=vec3(.7,.85,.7)*foam*field*(1.-u_settle)*scene.a;
  color=vec4(scene.rgb/max(scene.a,.00001),scene.a);
}`;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

export class Pond {
  static async create(canvas, onFallback) {
    const images = await Promise.all([loadImage('assets/pond.png'), loadImage('assets/kohaku.png'), loadImage('assets/pond-mobile.png')]);
    const pond = new Pond(canvas, images, onFallback);
    try { pond.initialize(); } catch (error) { pond.dispose(); throw error; }
    return pond;
  }

  constructor(canvas, images, onFallback) {
    this.canvas = canvas;
    this.images = images;
    this.onFallback = onFallback;
    this.gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, powerPreference: 'default' });
    if (!this.gl) throw new Error('WebGL 2 is unavailable.');
    this.time = 18;
    this.ripples = new Float32Array(64);
    this.rippleIndex = 0;
    this.width = 1;
    this.height = 1;
    this.active = true;
    this.motion = true;
    this.resources = [];
    this.raf = 0;
    this.lastStamp = 0;
    this.lastWake = 0;
    this.transition = null;
    this.swimmer = null;
    this.contextLost = false;
    this.dprCap = 1.5;
    this.frameTimes = [];
    this.tick = this.tick.bind(this);
    this.handleVisibility = () => document.hidden ? this.stop() : this.start();
    this.handleLost = event => { event.preventDefault(); this.contextLost = true; this.stop(); this.onFallback(true); };
    this.handleRestored = () => {
      try { this.resources = []; this.target = null; this.buildResources(); this.contextLost = false; this.resize(); this.onFallback(false); this.start(); }
      catch (error) { console.error('Pond context restore failed', error); this.onFallback(true); }
    };
  }

  track(kind, resource) { this.resources.push([kind, resource]); return resource; }

  program(vertex, fragment) {
    const gl = this.gl;
    const program = this.track('Program', gl.createProgram());
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message); }
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const uniforms = new Map();
    return { handle: program, uniform: name => { if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(program, name)); return uniforms.get(name); } };
  }

  texture(image) {
    const gl = this.gl;
    const texture = this.track('Texture', gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  mesh(program, attribute, vertices, indices) {
    const gl = this.gl;
    const vao = this.track('VertexArray', gl.createVertexArray());
    const buffer = this.track('Buffer', gl.createBuffer());
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program.handle, attribute);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    if (indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.track('Buffer', gl.createBuffer()));
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }
    gl.bindVertexArray(null);
    return { vao, count: indices ? indices.length : vertices.length / 2, indexed: Boolean(indices) };
  }

  buildResources() {
    this.background = this.program(screenVertex, backgroundFragment);
    this.fish = this.program(fishVertex, fishFragment);
    this.water = this.program(screenVertex, waterFragment);
    const triangle = [-1, -1, 3, -1, -1, 3];
    this.backgroundMesh = this.mesh(this.background, 'a_position', triangle);
    this.waterMesh = this.mesh(this.water, 'a_position', triangle);
    const vertices = [], indices = [], rows = 64, columns = 8;
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) vertices.push(x / columns, y / rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) { const a = y * (columns + 1) + x, b = a + columns + 1; indices.push(a, b, a + 1, a + 1, b, b + 1); }
    this.fishMesh = this.mesh(this.fish, 'a_uv', vertices, indices);
    this.pondTexture = this.texture(this.images[0]);
    this.fishTexture = this.texture(this.images[1]);
    this.mobileTexture = this.texture(this.images[2]);
  }

  initialize() {
    this.buildResources();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.canvas.addEventListener('webglcontextlost', this.handleLost);
    this.canvas.addEventListener('webglcontextrestored', this.handleRestored);
    this.resize();
    this.start();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height || this.contextLost) return;
    const previousWidth = this.width, previousHeight = this.height;
    this.width = rect.width;
    this.height = rect.height;
    if (!this.swimmer || this.width !== previousWidth || this.height !== previousHeight) {
      const copy = document.querySelector('.hero-copy').getBoundingClientRect();
      const layout = pondLayout(this.width, this.height, copy.bottom);
      if (this.swimmer) this.swimmer.resize(layout); else this.swimmer = new KoiMotion(layout);
    }
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    const width = Math.round(this.width * dpr), height = Math.round(this.height * dpr);
    if (this.canvas.width !== width || this.canvas.height !== height || !this.target) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.createTarget(width, height);
    }
    this.render();
  }

  createTarget(width, height) {
    const gl = this.gl;
    if (this.target) { gl.deleteTexture(this.target.texture); gl.deleteFramebuffer(this.target.framebuffer); }
    const texture = gl.createTexture(), framebuffer = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { gl.deleteTexture(texture); gl.deleteFramebuffer(framebuffer); this.target = null; throw new Error('Pond framebuffer unavailable'); }
    this.target = { texture, framebuffer };
  }

  draw(mesh) { const gl = this.gl; gl.bindVertexArray(mesh.vao); if (mesh.indexed) gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0); else gl.drawArrays(gl.TRIANGLES, 0, mesh.count); }
  bindTexture(program, texture, name = 'u_image') { const gl = this.gl; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(program.uniform(name), 0); }

  pose() {
    return this.transition ? this.transition.flight.sample(this.transition.elapsed).pose : this.swimmer.sampleFrame().pose;
  }

  render() {
    if (!this.target || this.contextLost) return;
    const gl = this.gl;
    const frame = this.transition ? this.transition.flight.sample(this.transition.elapsed) : this.swimmer.sampleFrame();
    const pose = frame.pose;
    const settle = frame?.settle ?? 0;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.target.framebuffer);
    gl.disable(gl.BLEND);
    gl.useProgram(this.background.handle);
    const portrait = this.width <= 760;
    const backdrop = this.images[portrait ? 2 : 0];
    this.bindTexture(this.background, portrait ? this.mobileTexture : this.pondTexture);
    gl.uniform2f(this.background.uniform('u_resolution'), this.width, this.height);
    gl.uniform1f(this.background.uniform('u_imageAspect'), backdrop.width / backdrop.height);
    gl.uniform1f(this.background.uniform('u_reveal'), frame?.backdrop ?? 0);
    this.draw(this.backgroundMesh);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.fish.handle);
    this.bindTexture(this.fish, this.fishTexture);
    const size = pose.length;
    gl.uniform2f(this.fish.uniform('u_resolution'), this.width, this.height);
    gl.uniform2fv(this.fish.uniform('u_spine[0]'), frame.spine);
    gl.uniform1f(this.fish.uniform('u_length'), size);
    gl.uniform1f(this.fish.uniform('u_beat'), pose.beat);
    gl.uniform1f(this.fish.uniform('u_speed'), pose.speed / size);
    gl.uniform1f(this.fish.uniform('u_settle'), settle);
    gl.uniform1f(this.fish.uniform('u_time'), this.time);
    gl.uniform2f(this.fish.uniform('u_offset'), size * .045, size * .07);
    gl.uniform1f(this.fish.uniform('u_shadow'), 1);
    this.draw(this.fishMesh);
    gl.uniform2f(this.fish.uniform('u_offset'), 0, 0);
    gl.uniform1f(this.fish.uniform('u_shadow'), 0);
    this.draw(this.fishMesh);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.water.handle);
    this.bindTexture(this.water, this.target.texture, 'u_scene');
    gl.uniform2f(this.water.uniform('u_resolution'), this.width, this.height);
    gl.uniform1f(this.water.uniform('u_time'), this.time);
    gl.uniform4fv(this.water.uniform('u_ripples[0]'), this.ripples);
    gl.uniform1f(this.water.uniform('u_settle'), settle);
    this.draw(this.waterMesh);
  }

  addRipple(x, y, strength = 1) {
    if (!this.motion) return;
    this.ripples.set([x, y, this.time, strength], this.rippleIndex * 4);
    this.rippleIndex = (this.rippleIndex + 1) % 16;
  }

  scareFish(x, y) {
    if (this.transition || !this.motion || !this.swimmer) return false;
    const accepted = this.swimmer.touch(x, y);
    this.start();
    return accepted;
  }

  beginTransition(destination, duration) {
    const frame = this.swimmer.sampleFrame();
    this.transition = { flight: new CollectionFlight(frame.pose, frame.spine, destination, duration), elapsed: 0, waterStartTime: this.time };
    this.stop();
  }
  setTransitionTime(elapsed) {
    if (this.transition) {
      this.transition.elapsed = elapsed;
      this.time = this.transition.waterStartTime + elapsed;
      this.render();
    }
  }
  reset() { this.transition = null; this.ripples.fill(0); this.lastStamp = 0; this.resize(); }
  setMotion(enabled) { this.motion = enabled; if (enabled) this.start(); else { this.stop(); this.render(); } }
  setActive(active) { this.active = active; if (active) { this.resize(); this.start(); } else this.stop(); }

  tick(stamp) {
    this.raf = 0;
    if (!this.active || !this.motion || this.contextLost || document.hidden) return;
    const frameMs = this.lastStamp ? stamp - this.lastStamp : 16.67;
    const dt = Math.min(frameMs / 1000, .1);
    this.lastStamp = stamp;
    this.time += dt;
    if (!this.transition) this.swimmer.advance(dt);
    const pose = this.pose();
    if (!this.transition && this.time - this.lastWake > .36) { this.addRipple(pose.x - Math.cos(pose.heading) * pose.length * .45, pose.y - Math.sin(pose.heading) * pose.length * .45, clamp(pose.speed / pose.length, .03, .22)); this.lastWake = this.time; }
    if (!this.transition && this.dprCap > 1) {
      this.frameTimes.push(frameMs);
      if (this.frameTimes.length >= 120) { const median = [...this.frameTimes].sort((a,b) => a-b)[60]; if (median > 28) { this.dprCap = 1; this.resize(); } this.frameTimes.length = 0; }
    }
    this.render();
    this.raf = requestAnimationFrame(this.tick);
  }
  start() { if (!this.raf && this.active && this.motion && !this.transition && !document.hidden && !this.contextLost) { this.lastStamp = 0; this.raf = requestAnimationFrame(this.tick); } }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; this.lastStamp = 0; }
  dispose() {
    this.stop();
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.canvas.removeEventListener('webglcontextlost', this.handleLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleRestored);
    if (this.target) { this.gl.deleteTexture(this.target.texture); this.gl.deleteFramebuffer(this.target.framebuffer); }
    this.resources.forEach(([kind, resource]) => this.gl[`delete${kind}`](resource));
    this.resources = [];
  }
}
