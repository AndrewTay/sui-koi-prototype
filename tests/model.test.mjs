import test from 'node:test';
import assert from 'node:assert/strict';
import { idlePose, isNearFish, touchedPose, transitionPose, smoothstep, selectSpecimens, parseSaved, specimens, TRANSITION_DURATION, REVEAL_START } from '../model.js';

test('entering starts at the exact live fish position and heading', () => {
  for (const [width, height] of [[1440,900],[390,844],[360,740]]) {
    for (const time of [0,18,50,120]) {
      const start = idlePose(time,width,height);
      const pose = transitionPose(0,width,height,start);
      assert.ok(Math.abs(start.x-pose.x)<1e-8);
      assert.ok(Math.abs(start.y-pose.y)<1e-8);
      assert.ok(Math.abs(start.heading-pose.heading)<1e-8);
    }
  }
});

test('entrance follows one smooth banking arc and accelerates into the reveal', () => {
  const width=1440,height=900,start=idlePose(18,width,height);
  let previousSpeed=0;
  const points=[];
  for(let t=0;t<=TRANSITION_DURATION;t+=.02){
    const pose=transitionPose(t,width,height,start);
    points.push(pose);
    assert.ok(pose.speed>=previousSpeed);
    previousSpeed=pose.speed;
  }
  assert.ok(Math.hypot(points.at(-1).x-points[0].x,points.at(-1).y-points[0].y)>120);
  assert.ok(points.every((point, index) => index === 0 || Math.hypot(point.x-points[index-1].x, point.y-points[index-1].y)<100));
  assert.ok(REVEAL_START>2&&REVEAL_START<TRANSITION_DURATION);
});

test('idle fish stays within the pond on narrow and wide screens', () => {
  for(const [width,height] of [[320,720],[390,844],[768,1024],[1440,900],[2560,1440]]){
    for(let t=0;t<180;t+=.1){
      const pose=idlePose(t,width,height);
      assert.ok(pose.x>0&&pose.x<width);
      assert.ok(pose.y>0&&pose.y<height);
      assert.ok(Number.isFinite(pose.heading));
    }
  }
});

test('idle fish follows two loose lobes instead of an orbit around one point', () => {
  const width = 1440, height = 900, centerX = width * .715, centerY = height * .465;
  const points = Array.from({ length: 240 }, (_, index) => idlePose(18 + index * .16, width, height));
  const left = points.filter(point => point.x < centerX - 18).length;
  const right = points.filter(point => point.x > centerX + 18).length;
  const centralPasses = points.filter(point => Math.abs(point.x - centerX) < 18 && Math.abs(point.y - centerY) < 26).length;
  assert.ok(left > 20 && right > 20);
  assert.ok(centralPasses > 1);
  assert.ok(new Set(points.map(point => point.heading.toFixed(2))).size > 20);
});

test('touch response moves the fish away quickly and settles back to idle motion', () => {
  const base = { x: 700, y: 420, heading: 0, speed: .5, bend: .035 };
  const immediate = touchedPose(base, 620, 420, 0);
  const early = touchedPose(base, 620, 420, .08);
  const burst = touchedPose(base, 620, 420, .55);
  const decelerating = touchedPose(base, 620, 420, 1.4);
  const settled = touchedPose(base, 620, 420, 3);
  assert.equal(immediate.x, base.x);
  assert.ok(early.x > base.x);
  assert.ok(burst.x > early.x + 25);
  assert.ok(decelerating.x < burst.x);
  assert.ok(burst.speed > base.speed);
  assert.ok(Math.abs(settled.x - base.x) < 20);
  assert.ok(Number.isFinite(burst.heading));
});

test('touch response rotates progressively and only accepts nearby clicks', () => {
  const base = { x: 700, y: 420, heading: 0, speed: .5, bend: .035 };
  const early = touchedPose(base, 800, 420, .25, base.heading);
  const later = touchedPose(base, 800, 420, 1.1, base.heading);
  assert.ok(Math.abs(early.heading) < Math.abs(later.heading));
  assert.equal(isNearFish(base, 745, 420, 50), true);
  assert.equal(isNearFish(base, 751, 420, 50), false);
});

test('transition remains finite with zero radius and clamped time', () => {
  const width=1440,height=900,start={x:width*.635,y:height*.49,heading:0};
  for(const t of [-100,0,.5,3.4,100]){
    const pose=transitionPose(t,width,height,start);
    for(const key of ['x','y','heading','speed','bend'])assert.ok(Number.isFinite(pose[key]));
  }
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

test('catalog identifiers and sprite slots are unique', () => {
  assert.equal(new Set(specimens.map(x=>x.id)).size,specimens.length);
  assert.equal(specimens.length,9);
  assert.ok(specimens.every(x=>[0,1,2].includes(x.sprite)));
  assert.equal(new Set(specimens.map(x=>x.variant)).size,specimens.length);
});

test('smooth interpolation clamps and is monotonic', () => {
  assert.equal(smoothstep(-1),0);assert.equal(smoothstep(2),1);
  let previous=-1;
  for(let x=0;x<=1;x+=.01){const value=smoothstep(x);assert.ok(value>=previous);previous=value;}
});
