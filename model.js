export const TRANSITION_DURATION = 3.6;
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const smoothstep = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const mix = (a, b, t) => a + (b - a) * t;

export const specimens = Object.freeze([
  { id: 'kohaku-01', name: 'Kohaku', variety: 'Kohaku', japanese: '紅白', number: '01', size: '54 cm', age: '3 years', artwork: { src: 'assets/kohaku.png', columns: 1, index: 0, aspect: '2 / 3' }, description: 'White base with red pattern plates across the head and back' },
  { id: 'showa-02', name: 'Showa', variety: 'Showa', japanese: '昭和', number: '02', size: '61 cm', age: '4 years', artwork: { src: 'assets/catalog.png', columns: 3, index: 1, aspect: '1 / 2' }, description: 'Black and red markings over an ivory base' },
  { id: 'ogon-03', name: 'Yamabuki Ogon', variety: 'Ogon', japanese: '黄金', number: '03', size: '48 cm', age: '2 years', artwork: { src: 'assets/catalog.png', columns: 3, index: 2, aspect: '1 / 2' }, description: 'Metallic gold scales from head to tail' },
  { id: 'sanke-04', name: 'Sanke', variety: 'Sanke', japanese: '三色', number: '04', size: '56 cm', age: '3 years', artwork: { src: 'assets/catalog-sanke-tancho-goshiki.png', columns: 3, index: 0, aspect: '1 / 2' }, description: 'White base with red and black markings' },
  { id: 'tancho-05', name: 'Tancho', variety: 'Tancho', japanese: '丹頂', number: '05', size: '49 cm', age: '2 years', artwork: { src: 'assets/catalog-sanke-tancho-goshiki.png', columns: 3, index: 1, aspect: '1 / 2' }, description: 'White body with a single red head mark' },
  { id: 'goshiki-06', name: 'Goshiki', variety: 'Goshiki', japanese: '五色', number: '06', size: '58 cm', age: '4 years', artwork: { src: 'assets/catalog-sanke-tancho-goshiki.png', columns: 3, index: 2, aspect: '1 / 2' }, description: 'Blue grey red black and white patterning' },
  { id: 'kujaku-07', name: 'Kujaku', variety: 'Kujaku', japanese: '孔雀', number: '07', size: '53 cm', age: '3 years', artwork: { src: 'assets/catalog-kujaku-shiro-chagoi.png', columns: 3, index: 0, aspect: '1 / 2' }, description: 'Platinum scales with dark reticulation and orange patches' },
  { id: 'shiro-utsuri-08', name: 'Shiro Utsuri', variety: 'Shiro Utsuri', japanese: '白写り', number: '08', size: '60 cm', age: '4 years', artwork: { src: 'assets/catalog-kujaku-shiro-chagoi.png', columns: 3, index: 1, aspect: '1 / 2' }, description: 'Black and white patterning with hard edges' },
  { id: 'chagoi-09', name: 'Chagoi', variety: 'Chagoi', japanese: '茶鯉', number: '09', size: '63 cm', age: '5 years', artwork: { src: 'assets/catalog-kujaku-shiro-chagoi.png', columns: 3, index: 2, aspect: '1 / 2' }, description: 'Warm tea brown scales with an even tone' },
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
