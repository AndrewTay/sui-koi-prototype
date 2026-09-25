export const TRANSITION_DURATION = 3.4;
export const REVEAL_START = 2.55;
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const smoothstep = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const mix = (a, b, t) => a + (b - a) * t;

export const specimens = Object.freeze([
  { id: 'kohaku-01', name: 'Kohaku', variety: 'Kohaku', japanese: '紅白', number: '01', size: '54 cm', age: '3 years', sprite: 0, variant: 'kohaku', description: 'White base with red pattern plates across the head and back' },
  { id: 'showa-02', name: 'Showa', variety: 'Showa', japanese: '昭和', number: '02', size: '61 cm', age: '4 years', sprite: 1, variant: 'showa', description: 'Black and red markings over an ivory base' },
  { id: 'ogon-03', name: 'Yamabuki Ogon', variety: 'Ogon', japanese: '黄金', number: '03', size: '48 cm', age: '2 years', sprite: 2, variant: 'ogon', description: 'Metallic gold scales from head to tail' },
  { id: 'sanke-04', name: 'Sanke', variety: 'Sanke', japanese: '三色', number: '04', size: '56 cm', age: '3 years', sprite: 1, variant: 'sanke', description: 'White base with red and black markings' },
  { id: 'tancho-05', name: 'Tancho', variety: 'Tancho', japanese: '丹頂', number: '05', size: '49 cm', age: '2 years', sprite: 0, variant: 'tancho', description: 'White body with a single red head mark' },
  { id: 'goshiki-06', name: 'Goshiki', variety: 'Goshiki', japanese: '五色', number: '06', size: '58 cm', age: '4 years', sprite: 1, variant: 'goshiki', description: 'Blue grey red black and white patterning' },
  { id: 'kujaku-07', name: 'Kujaku', variety: 'Kujaku', japanese: '孔雀', number: '07', size: '53 cm', age: '3 years', sprite: 2, variant: 'kujaku', description: 'Platinum scales with dark reticulation and orange patches' },
  { id: 'shiro-utsuri-08', name: 'Shiro Utsuri', variety: 'Shiro Utsuri', japanese: '白写り', number: '08', size: '60 cm', age: '4 years', sprite: 1, variant: 'shiro', description: 'Black and white patterning with hard edges' },
  { id: 'chagoi-09', name: 'Chagoi', variety: 'Chagoi', japanese: '茶鯉', number: '09', size: '63 cm', age: '5 years', sprite: 0, variant: 'chagoi', description: 'Warm tea brown scales with an even tone' },
]);

export function selectSpecimens(variety, shortlistOnly, saved) {
  return specimens.filter(fish => (variety === 'all' || fish.variety === variety) && (!shortlistOnly || saved.has(fish.id)));
}

export function parseSaved(raw) {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    const valid = new Set(specimens.map(fish => fish.id));
    return new Set(value.filter(id => typeof id === 'string' && valid.has(id)));
  } catch { return new Set(); }
}

// Heading is the direction of travel; artwork points up before rotation. The idle path is a
// deliberately imperfect lemniscate: two broad lobes, a soft drift, and a changing pace keep
// the fish from orbiting an obvious central point.
export function idlePose(time, width, height) {
  const mobile = width <= 760;
  const centerX = width * (mobile ? .70 : .715);
  const centerY = height * (mobile ? .728 : .465);
  const radiusX = Math.min(width * (mobile ? .16 : .20), 300);
  const radiusY = Math.min(height * (mobile ? .07 : .16), 150);
  const phase = time * .16;
  const driftX = Math.sin(time * .019 + 1.3) * radiusX * .20;
  const driftY = Math.cos(time * .015 - .4) * radiusY * .18;
  const x = centerX + driftX + radiusX * (.86 * Math.sin(phase) + .14 * Math.sin(phase * 2 + .55));
  const y = centerY + driftY + radiusY * (.88 * Math.sin(phase * 2) + .12 * Math.sin(phase + .7));
  const dx = radiusX * (.86 * Math.cos(phase) + .28 * Math.cos(phase * 2 + .55));
  const dy = radiusY * (1.76 * Math.cos(phase * 2) + .12 * Math.cos(phase + .7));
  const pathVelocity = Math.hypot(dx, dy) * .16;
  const heading = Math.atan2(dy, dx);
  const speed = clamp(pathVelocity / Math.max(width, height) * 8, .38, .9);
  return { x, y, heading, speed, bend: .035 + .014 * Math.sin(phase + .8) };
}

export function touchedPose(base, clickX, clickY, age, initialHeading = base.heading) {
  const dx = base.x - clickX;
  const dy = base.y - clickY;
  const distance = Math.hypot(dx, dy);
  const direction = distance > 2 ? { x: dx / distance, y: dy / distance } : { x: Math.cos(base.heading), y: Math.sin(base.heading) };
  const influence = clamp(1 - distance / 600, .35, 1);
  // A damped impulse gives the fish a visible build-up, a brief fastest point, and a long settle
  // instead of teleporting to a fixed offset on the first frame after the click.
  const burst = (1 - (1 + age * 5) * Math.exp(-age * 5)) * Math.exp(-age * .85);
  const displacement = 240 * influence * burst;
  const lateral = Math.sin(age * 7.2) * 10 * influence * burst;
  const fleeHeading = Math.atan2(direction.y, direction.x);
  const fleeDelta = Math.atan2(Math.sin(fleeHeading - initialHeading), Math.cos(fleeHeading - initialHeading));
  const fleeTurn = smoothstep(age / 1.25);
  const fleeHeadingNow = initialHeading + fleeDelta * fleeTurn;
  const settleDelta = Math.atan2(Math.sin(base.heading - fleeHeadingNow), Math.cos(base.heading - fleeHeadingNow));
  const settle = smoothstep((age - 2) / 1.5);
  const heading = fleeHeadingNow + settleDelta * settle;
  return {
    ...base,
    x: base.x + direction.x * displacement - direction.y * lateral,
    y: base.y + direction.y * displacement + direction.x * lateral,
    heading,
    speed: Math.max(base.speed, .45 + 2.9 * (1 - Math.exp(-age * 3)) * Math.exp(-age * .95)),
    bend: base.bend + .04 * burst,
  };
}

export function isNearFish(pose, clickX, clickY, reach) {
  return Math.hypot(pose.x - clickX, pose.y - clickY) <= reach;
}

export function transitionPose(elapsed, width, height, start) {
  const mobile = width <= 760;
  const center = { x: width * (mobile ? .54 : .635), y: height * (mobile ? .575 : .49) };
  const end = { x: center.x + width * (mobile ? .018 : .012), y: center.y + height * (mobile ? .022 : .018) };
  const t = clamp(elapsed / TRANSITION_DURATION);
  const forward = { x: Math.cos(start.heading), y: Math.sin(start.heading) };
  const toEndLength = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const toEnd = { x: (end.x - start.x) / toEndLength, y: (end.y - start.y) / toEndLength };
  const handle = Math.max(70, Math.min(Math.min(width, height) * .26, toEndLength * .42));
  const p1 = { x: start.x + forward.x * handle, y: start.y + forward.y * handle };
  const p2 = { x: end.x - toEnd.x * handle * .78, y: end.y - toEnd.y * handle * .78 };
  const oneMinus = 1 - t;
  const x = oneMinus ** 3 * start.x + 3 * oneMinus ** 2 * t * p1.x + 3 * oneMinus * t ** 2 * p2.x + t ** 3 * end.x;
  const y = oneMinus ** 3 * start.y + 3 * oneMinus ** 2 * t * p1.y + 3 * oneMinus * t ** 2 * p2.y + t ** 3 * end.y;
  const tangentX = 3 * oneMinus ** 2 * (p1.x - start.x) + 6 * oneMinus * t * (p2.x - p1.x) + 3 * t ** 2 * (end.x - p2.x);
  const tangentY = 3 * oneMinus ** 2 * (p1.y - start.y) + 6 * oneMinus * t * (p2.y - p1.y) + 3 * t ** 2 * (end.y - p2.y);
  const heading = Math.atan2(tangentY, tangentX);
  return { x, y, heading, speed: .7 + 3.4 * smoothstep(t), bend: .035 + .08 * smoothstep(t), center };
}
