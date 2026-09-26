import test from 'node:test';
import assert from 'node:assert/strict';
import { smoothstep, selectSpecimens, parseSaved, specimens } from '../model.js';
import { KoiMotion, CollectionFlight, pondLayout, TURN_RATE_LIMIT, TURN_ACCELERATION_LIMIT, SPINE_COUNT, JOINT_ANGLE_LIMIT, wrapAngle, nearBody } from '../swimming.js';

const advance = (motion, seconds, step = 1 / 60) => { for (let t = 0; t < seconds; t += step) motion.advance(step); };
const layouts = [[320,720],[390,844],[768,1024],[1440,900],[2560,1440]];

test('nearby touches change intent without resetting position, heading, speed, or turn rate', () => {
  const motion = new KoiMotion(pondLayout(1440,900));
  advance(motion,5);
  for (let click = 0; click < 8; click++) {
    const before = motion.pose();
    assert.equal(motion.touch(before.x+30,before.y),true);
    assert.deepEqual(motion.pose(),before);
    advance(motion,.16);
  }
});

test('distant clicks do not excite or steer the fish', () => {
  const motion = new KoiMotion(pondLayout(390,844));
  const before = motion.pose();
  assert.equal(motion.touch(0,0),false);
  assert.equal(motion.alarm,0);
  assert.deepEqual(motion.pose(),before);
  assert.ok(nearBody(before,before.x,before.y));
});

test('touch response preserves bounded angular acceleration and forward movement', () => {
  const motion = new KoiMotion(pondLayout(1440,900));
  const s = motion.pose();
  motion.touch(s.x+20,s.y-15);
  let previous = s;
  for(let frame=0;frame<1200;frame++) {
    const now=motion.advance(1/120);
    assert.ok(Math.abs(now.turnRate)<=TURN_RATE_LIMIT+1e-9);
    assert.ok(Math.abs(now.turnRate-previous.turnRate)<=TURN_ACCELERATION_LIMIT/120+1e-8);
    const distance=Math.hypot(now.x-previous.x,now.y-previous.y);
    assert.ok(distance<=now.speed/120+1e-6);
    assert.ok((now.x-previous.x)*Math.cos(now.heading)+(now.y-previous.y)*Math.sin(now.heading)>=-1e-7);
    previous=now;
  }
  assert.equal(motion.alarm,0);
});

test('fish accelerates into a nearby startle and decelerates after recovery', () => {
  const motion = new KoiMotion(pondLayout(1440,900));
  const s=motion.pose();
  motion.touch(s.x-Math.cos(s.heading)*30,s.y-Math.sin(s.heading)*30);
  const initial=motion.pose().speed;
  advance(motion,.7);
  const burst=motion.pose().speed;
  assert.ok(burst>initial*1.12);
  advance(motion,5);
  assert.ok(motion.pose().speed<burst);
});

test('long runs and repeated touches stay inside the swimming region at every breakpoint', () => {
  for(const [width,height] of layouts) {
    const motion=new KoiMotion(pondLayout(width,height)),b=motion.layout.bounds;
    for(let i=0;i<10800;i++) {
      if(i%277===0) { const p=motion.pose(); motion.touch(p.x+(i%2 ? 20 : -20),p.y+10); }
      const p=motion.advance(1/60);
      assert.ok(p.x>=b.left-1e-6&&p.x<=b.right+1e-6&&p.y>=b.top-1e-6&&p.y<=b.bottom+1e-6);
      assert.ok(Object.values(p).every(Number.isFinite));
    }
  }
});

test('the articulated spine has fixed segment lengths and bounded curvature during tight turns', () => {
  const motion=new KoiMotion(pondLayout(390,844));
  for(let i=0;i<1800;i++) {
    if(i%131===0) { const p=motion.pose(); motion.touch(p.x,p.y-15); }
    motion.advance(1/60);
    if(i%10)continue;
    const pose=motion.pose(),spine=motion.spine(),step=pose.length/(SPINE_COUNT-1);
    let lastAngle=pose.heading+Math.PI;
    for(let j=1;j<SPINE_COUNT;j++) {
      const dx=spine[j*2]-spine[(j-1)*2],dy=spine[j*2+1]-spine[(j-1)*2+1];
      assert.ok(Math.abs(Math.hypot(dx,dy)-step)<.00015);
      const angle=Math.atan2(dy,dx);
      assert.ok(Math.abs(wrapAngle(angle-lastAngle))<=JOINT_ANGLE_LIMIT+.0001);
      lastAngle=angle;
    }
  }
});

test('simulation gives the same trajectory at 30, 60, and 120 frames per second', () => {
  const states=[30,60,120].map(fps=>{const m=new KoiMotion(pondLayout(1440,900)); for(let n=0;n<fps*20;n++)m.advance(1/fps);return m.pose();});
  for(const p of states)assert.ok(Math.hypot(p.x-states[0].x,p.y-states[0].y)<.001);
});

test('gallery handoff begins with identical live pose and spine and lands exactly on card', () => {
  const motion=new KoiMotion(pondLayout(1440,900));advance(motion,14);
  const start=motion.pose(),spine=motion.spine(),end={x:260,y:470,length:310};
  const flight=new CollectionFlight(start,spine,end);
  const first=flight.sample(0),last=flight.sample(flight.duration);
  assert.equal(first.pose.x,start.x);assert.equal(first.pose.y,start.y);assert.equal(first.pose.heading,start.heading);
  first.spine.forEach((v,i)=>assert.ok(Math.abs(v-spine[i])<.0002));
  assert.equal(last.pose.x,end.x);assert.equal(last.pose.y,end.y);assert.equal(last.pose.length,end.length);
  assert.ok(Math.abs(wrapAngle(last.pose.heading+Math.PI/2))<1e-9);
  assert.equal(last.pose.speed,0);assert.equal(last.backdrop,1);assert.equal(last.settle,1);
  assert.ok(Math.abs(last.spine[1]-(end.y-end.length*.46))<.0001);
});

test('handoff preserves the initial velocity and decelerates to zero with no positional snap', () => {
  const m=new KoiMotion(pondLayout(1440,900));advance(m,7);
  const s=m.pose(),flight=new CollectionFlight(s,m.spine(),{x:250,y:470,length:310}),dt=.00001;
  const a=flight.sample(dt).pose,z=flight.sample(flight.duration).pose,y=flight.sample(flight.duration-dt).pose;
  assert.ok(Math.abs((a.x-s.x)/dt-Math.cos(s.heading)*s.speed)<.01);
  assert.ok(Math.abs((a.y-s.y)/dt-Math.sin(s.heading)*s.speed)<.01);
  assert.ok(Math.hypot(z.x-y.x,z.y-y.y)/dt<.01);
});

test('resize remaps swimming bounds without invalidating motion or the spine', () => {
  const m=new KoiMotion(pondLayout(1440,900));advance(m,12);
  m.resize(pondLayout(390,844));
  advance(m,2);
  assert.equal(m.state.length,m.layout.length);
  assert.ok(m.spine().every(Number.isFinite));
});

test('variety filters and shortlist intersect correctly', () => {
  const saved=new Set(['kohaku-01','ogon-03']);
  assert.equal(selectSpecimens('all',false,saved).length,9);
  assert.deepEqual(selectSpecimens('Showa',false,saved).map(x=>x.id),['showa-02']);
  assert.deepEqual(selectSpecimens('all',true,saved).map(x=>x.id),['kohaku-01','ogon-03']);
  assert.equal(selectSpecimens('Showa',true,saved).length,0);
});

test('saved data rejects corrupt input, unknown ids, and non-array structures', () => {
  for(const raw of [null,'','{broken','{}','true','42'])assert.equal(parseSaved(raw).size,0);
  assert.deepEqual([...parseSaved('["kohaku-01","kohaku-01","unknown",9,null]')],['kohaku-01']);
});

test('each catalog entry has its own artwork region', () => {
  assert.equal(new Set(specimens.map(x=>x.id)).size,specimens.length);
  assert.equal(specimens.length,9);
  assert.ok(specimens.every(x => x.artwork.index < x.artwork.columns));
  assert.equal(new Set(specimens.map(x => `${x.artwork.src}:${x.artwork.index}`)).size, specimens.length);
});

test('smooth interpolation clamps and is monotonic', () => {
  assert.equal(smoothstep(-1),0);assert.equal(smoothstep(2),1);
  let previous=-1;
  for(let x=0;x<=1;x+=.01){const value=smoothstep(x);assert.ok(value>=previous);previous=value;}
});
