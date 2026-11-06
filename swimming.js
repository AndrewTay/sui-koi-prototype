import { clamp, mix, smoothstep } from './model.js';

export const TURN_RATE_LIMIT = .68;
export const TURN_ACCELERATION_LIMIT = 1.1;
export const SPINE_COUNT = 25;
export const JOINT_ANGLE_LIMIT = .04;
export const SIMULATION_STEP = 1 / 120;
export const wrapAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
const approach = (current, target, maximum) => current + clamp(target - current, -maximum, maximum);

// A stroke, a glide and a quiet hold. The envelope joins continuously at the loop.
export function swimmingEffort(time) {
  const phase = ((time % 12) + 12) % 12;
  return Math.max(1 - smoothstep((phase - 1.8) / 2.4), smoothstep((phase - 9.2) / 2.8));
}

export function wakeStrength(pose) {
  return clamp((pose.speed / pose.length - .035) * .8, 0, .20) * (.25 + .75 * pose.effort);
}

export function pondLayout(width, height, copyBottom = height * .57) {
  const mobile = width <= 760;
  const surface = mobile
    ? { left: 20, right: width - 20, top: Math.min(copyBottom + 22, height * .65), bottom: height - 65 }
    : { left: width * .46, right: width - 28, top: 105, bottom: height - 75 };
  const length = Math.min(mobile ? width * .46 : width * .22, height * .36, 320, (surface.bottom - surface.top) * .67, (surface.right - surface.left) * .60);
  const inset = length * .52;
  return { width, height, length, bounds: { left: surface.left + inset, right: surface.right - inset, top: surface.top + inset, bottom: surface.bottom - inset } };
}

// Click hit area follows the fish's orientation and covers head, body, and tail.
export function nearBody(state, x, y) {
  const dx = x - state.x, dy = y - state.y;
  const along = dx * Math.cos(state.heading) + dy * Math.sin(state.heading);
  const across = -dx * Math.sin(state.heading) + dy * Math.cos(state.heading);
  return (along / (state.length * .52 + 16)) ** 2 + (across / (state.length * .18 + 20)) ** 2 <= 1;
}

// Integrate forward swimming in small time steps. Heading, velocity, and acceleration persist
// across touches; recovery only changes steering intent, never position or rotation.
export class KoiMotion {
  constructor(layout) {
    this.layout = layout;
    const b = layout.bounds;
    this.state = { x: mix(b.left, b.right, .66), y: mix(b.top, b.bottom, .55), heading: -2.45, turnRate: 0, speed: layout.length * .15, acceleration: 0, length: layout.length, beat: 0, effort: .7, finPhase: 0, finActivity: .6 };
    this.phase = .7;
    this.time = 0;
    this.alarm = 0;
    this.threat = null;
    this.remainder = 0;
    this.jointAngles = new Float64Array(SPINE_COUNT - 1);
    this.jointRates = new Float64Array(SPINE_COUNT - 1);
    this.previousJointAngles = new Float64Array(SPINE_COUNT - 1);
    this.initializeBody();
  }

  initializeBody() {
    this.jointAngles.fill(this.state.heading + Math.PI);
    this.previousJointAngles.set(this.jointAngles);
    this.jointRates.fill(0);
    this.previousState = { ...this.state };
    this.remainder = 0;
  }
  nose() { const s = this.state; return { x: s.x + Math.cos(s.heading) * s.length * .46, y: s.y + Math.sin(s.heading) * s.length * .46 }; }
  pose() { return { ...this.state }; }

  touch(x, y) {
    if (!nearBody(this.state, x, y)) return false;
    const s = this.state;
    // A click exactly at the centre favours the existing direction, avoiding an arbitrary flip.
    if (Math.hypot(x - s.x, y - s.y) < 4) { x -= Math.cos(s.heading) * 10; y -= Math.sin(s.heading) * 10; }
    this.threat = { x, y };
    this.alarm = 1;
    return true;
  }

  resize(layout) {
    const old = this.layout.bounds, b = layout.bounds;
    const sx = (b.right - b.left) / Math.max(1, old.right - old.left);
    const sy = (b.bottom - b.top) / Math.max(1, old.bottom - old.top);
    this.state.x = clamp(b.left + (this.state.x - old.left) * sx, b.left, b.right);
    this.state.y = clamp(b.top + (this.state.y - old.top) * sy, b.top, b.bottom);
    const scale = layout.length / this.state.length;
    this.state.length = layout.length;
    this.state.speed *= scale;
    this.state.acceleration *= scale;
    this.layout = layout;
    this.threat = null;
    this.alarm = 0;
    this.initializeBody();
  }

  advance(seconds) {
    this.remainder += clamp(seconds, 0, .1);
    while (this.remainder >= SIMULATION_STEP) { this.step(SIMULATION_STEP); this.remainder -= SIMULATION_STEP; }
    return this.pose();
  }

  step(dt) {
    const s = this.state, b = this.layout.bounds;
    this.previousState = { ...s };
    this.previousJointAngles.set(this.jointAngles);
    this.time += dt;
    this.phase += dt * .105;
    // A moving, loose figure-eight is a steering target, never a rail the fish snaps onto.
    const cx = (b.left + b.right) * .5, cy = (b.top + b.bottom) * .5;
    const goal = { x: cx + (b.right - b.left) * .43 * Math.sin(this.phase), y: cy + (b.bottom - b.top) * .43 * Math.sin(this.phase * 2 + .3) };
    const distance = Math.max(1, Math.hypot(goal.x - s.x, goal.y - s.y));
    let dx = (goal.x - s.x) / distance, dy = (goal.y - s.y) / distance;
    if (this.threat) {
      const awayX = s.x - this.threat.x, awayY = s.y - this.threat.y;
      const awayLength = Math.max(1, Math.hypot(awayX, awayY));
      dx += awayX / awayLength * this.alarm * 4;
      dy += awayY / awayLength * this.alarm * 4;
    }
    // Look ahead to begin banking well before reaching the edge.
    const look = s.length * .22 + s.speed * 1.2;
    const px = s.x + Math.cos(s.heading) * look, py = s.y + Math.sin(s.heading) * look;
    const marginX = Math.max(12, (b.right - b.left) * .27), marginY = Math.max(12, (b.bottom - b.top) * .30);
    dx += clamp((b.left + marginX - px) / marginX, 0, 2) * 5 - clamp((px - b.right + marginX) / marginX, 0, 2) * 5;
    dy += clamp((b.top + marginY - py) / marginY, 0, 2) * 5 - clamp((py - b.bottom + marginY) / marginY, 0, 2) * 5;
    const error = wrapAngle(Math.atan2(dy, dx) - s.heading);
    const desiredTurn = clamp(error * .85, -TURN_RATE_LIMIT, TURN_RATE_LIMIT) * (.1 + .9 * smoothstep(s.speed / s.length / .07));
    s.turnRate = approach(s.turnRate, desiredTurn, TURN_ACCELERATION_LIMIT * dt);
    s.heading += s.turnRate * dt;
    const intent = Math.max(swimmingEffort(this.time) * .85, this.alarm);
    s.effort += (intent - s.effort) * (1 - Math.exp(-dt * 3));
    const cruise = s.length * (.018 + .19 * s.effort);
    let targetSpeed = cruise * (1 + this.alarm * 2.5) / (1 + Math.abs(error) * .32);
    const cos = Math.cos(s.heading), sin = Math.sin(s.heading);
    const roomX = Math.abs(cos) < .001 ? Infinity : (cos > 0 ? b.right - s.x : s.x - b.left) / Math.abs(cos);
    const roomY = Math.abs(sin) < .001 ? Infinity : (sin > 0 ? b.bottom - s.y : s.y - b.top) / Math.abs(sin);
    const room = Math.max(0, Math.min(roomX, roomY));
    const brake = s.length * .5;
    targetSpeed = Math.min(targetSpeed, Math.sqrt(2 * brake * Math.max(0, room - 8)));
    const desiredAcceleration = clamp((targetSpeed - s.speed) * 2.8, -brake, s.length * .42);
    s.acceleration = approach(s.acceleration, desiredAcceleration, s.length * 1.8 * dt);
    s.speed = Math.max(0, s.speed + s.acceleration * dt);
    // The last few pixels are a collision boundary, not an animation reset.
    s.speed = Math.min(s.speed, room / dt);
    s.x += cos * s.speed * dt;
    s.y += sin * s.speed * dt;
    s.beat += dt * (.25 + s.effort * 7.5);
    s.finPhase += dt * (3.2 + (1 - s.effort) * 1.3);
    const finTarget = clamp(.25 + (1 - s.effort) * .6 + Math.abs(s.turnRate) * .2);
    s.finActivity += (finTarget - s.finActivity) * (1 - Math.exp(-dt * 4));
    this.alarm *= Math.exp(-dt * 1.15);
    if (this.alarm < .006) { this.alarm = 0; this.threat = null; }
    this.updateBody(dt);
  }

  updateBody(dt) {
    let parentAngle = this.state.heading + Math.PI;
    let parentRate = this.state.turnRate;
    for (let i = 0; i < this.jointAngles.length; i++) {
      // A critically damped joint follows its parent in time. No sampled-trail segment can
      // replace its tangent abruptly. Unwrapped angles also avoid a discontinuity at ±pi.
      const frequency = 24 - i * .30;
      const angle = this.jointAngles[i], rate = this.jointRates[i];
      const along = (i + 1) / (SPINE_COUNT - 1);
      const rear = smoothstep((along - .25) / .75);
      const wave = this.state.effort * smoothstep(this.state.speed / this.state.length / .06) * rear * rear * .012 * Math.sin(this.state.beat - along * 5.2);
      const target = parentAngle + wave;
      const offset = angle - target;
      const decay = Math.exp(-frequency * dt);
      const c = rate + frequency * offset;
      const desired = target + (offset + c * dt) * decay;
      const constrained = clamp(desired, parentAngle - JOINT_ANGLE_LIMIT, parentAngle + JOINT_ANGLE_LIMIT);
      this.jointAngles[i] = constrained;
      this.jointRates[i] = constrained === desired ? (rate - frequency * c * dt) * decay : parentRate;
      parentAngle = constrained;
      parentRate = this.jointRates[i];
    }
  }

  buildSpine(pose, alpha = 1) {
    const result = new Float32Array(SPINE_COUNT * 2), step = pose.length / (SPINE_COUNT - 1);
    result[0] = pose.x + Math.cos(pose.heading) * pose.length * .46;
    result[1] = pose.y + Math.sin(pose.heading) * pose.length * .46;
    for (let i = 0; i < this.jointAngles.length; i++) {
      const angle = mix(this.previousJointAngles[i], this.jointAngles[i], alpha);
      result[(i + 1) * 2] = result[i * 2] + Math.cos(angle) * step;
      result[(i + 1) * 2 + 1] = result[i * 2 + 1] + Math.sin(angle) * step;
    }
    return result;
  }

  spine() { return this.buildSpine(this.state); }

  // Rendering is one fixed step behind the simulation, interpolated to the exact display
  // timestamp. Screens at 90/144 Hz and slightly irregular 60 Hz no longer repeat/jump states.
  sampleFrame() {
    const alpha = clamp(this.remainder / SIMULATION_STEP);
    const pose = {};
    for (const key of Object.keys(this.state)) pose[key] = mix(this.previousState[key], this.state[key], alpha);
    return { pose, spine: this.buildSpine(pose, alpha) };
  }
}

export function straightSpine(pose) {
  const result = new Float32Array(SPINE_COUNT * 2);
  for (let i = 0; i < SPINE_COUNT; i++) {
    const along = (.46 - i / (SPINE_COUNT - 1)) * pose.length;
    result[i * 2] = pose.x + Math.cos(pose.heading) * along;
    result[i * 2 + 1] = pose.y + Math.sin(pose.heading) * along;
  }
  return result;
}

// Cubic Hermite handoff matches the live velocity and stops exactly on the catalog artwork.
export class CollectionFlight {
  constructor(start, spine, destination, duration = 3.6) {
    this.start = { ...start };
    this.initialSpine = spine.slice();
    this.destination = { ...destination };
    this.duration = duration;
    this.rotation = wrapAngle(-Math.PI / 2 - start.heading);
  }
  sample(elapsed) {
    const t = clamp(elapsed / this.duration), p = smoothstep(t);
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2;
    const s = this.start, d = this.destination;
    const vx = Math.cos(s.heading) * s.speed * this.duration, vy = Math.sin(s.heading) * s.speed * this.duration;
    const x = h00 * s.x + h10 * vx + h01 * d.x;
    const y = h00 * s.y + h10 * vy + h01 * d.y;
    const heading = s.heading + this.rotation * p;
    const length = mix(s.length, d.length, p);
    const pose = { x, y, heading, length, speed: s.speed * (1 - p), turnRate: s.turnRate * (1 - p), beat: s.beat, effort: s.effort * (1 - p), finPhase: s.finPhase + (elapsed - elapsed ** 2 / (2 * this.duration)) * 3.2, finActivity: s.finActivity * (1 - p) };
    const straight = straightSpine(pose), original = straightSpine(s);
    const angle = heading - s.heading, cos = Math.cos(angle), sin = Math.sin(angle);
    for (let i = 0; i < SPINE_COUNT; i++) {
      const dx = this.initialSpine[i * 2] - original[i * 2], dy = this.initialSpine[i * 2 + 1] - original[i * 2 + 1];
      straight[i * 2] += (dx * cos - dy * sin) * (1 - p);
      straight[i * 2 + 1] += (dx * sin + dy * cos) * (1 - p);
    }
    return { pose, spine: straight, settle: p, backdrop: smoothstep((t - .12) / .66) };
  }
}
