import './marketplace-dist/marketplace.js';
import { Pond } from './pond.js';
import { TRANSITION_DURATION, smoothstep } from './model.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const home = $('#home'), catalog = $('#catalog'), canvas = $('#pond');
const skipLink = $('.skip-link');
const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reducedMedia.matches;
let pond = null, page = 'pond', sequence = 0;
let flightAbort = null;
function announce(message) { $('#announcer').textContent = message; }
function setHash(hash, replace = false) { if (location.hash !== hash) history[replace ? 'replaceState' : 'pushState'](null, '', hash); }

function finishCatalog(push = true, focus = true) {
  flightAbort?.abort();
  page = 'catalog';
  home.hidden = true;
  home.inert = true;
  canvas.hidden = true;
  canvas.classList.remove('transport');
  catalog.hidden = false;
  catalog.inert = false;
  catalog.classList.remove('revealing', 'receiving');
  catalog.style.opacity = '';
  pond?.setActive(false);
  document.body.style.overflow = '';
  document.body.dataset.page = 'collection';
  document.querySelector('meta[name="theme-color"]').content = '#f4f1e8';
  document.title = `${location.hash === '#offers' ? 'Offers' : location.hash === '#sell' ? 'List a Specimen' : location.hash === '#saved' ? 'Saved Specimens' : 'The Collection'} — MIZU`;
  skipLink.href = '#catalog-title';
  skipLink.textContent = 'Skip to the collection';
  if (push) setHash('#collection');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) $('#catalog-title').focus({ preventScroll: true });
  announce('The collection is ready to explore');
}

function showPond(push = true) {
  flightAbort?.abort();
  sequence++;
  page = 'pond';
  window.dispatchEvent(new Event('mizu:close-dialogs'));
  home.hidden = false;
  home.inert = false;
  home.classList.remove('departing');
  home.classList.add('returning');
  canvas.hidden = false;
  canvas.classList.remove('transport');
  catalog.hidden = true;
  catalog.inert = true;
  catalog.classList.remove('revealing', 'receiving');
  catalog.style.opacity = '';
  document.body.style.overflow = '';
  document.body.dataset.page = 'pond';
  document.querySelector('meta[name="theme-color"]').content = '#163f38';
  document.title = 'MIZU — Living Jewels';
  skipLink.href = '#enter';
  skipLink.textContent = 'Skip to browse the collection';
  if (push) setHash('#pond');
  pond?.reset();
  pond?.setActive(true);
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('#enter').focus({ preventScroll: true });
  announce('Back at the pond');
}

function enterCollection(push = true) {
  if (page !== 'pond') return;
  const run = ++sequence;
  page = 'entering';
  home.inert = true;
  home.classList.remove('returning');
  home.classList.add('departing');
  document.body.style.overflow = 'hidden';
  document.body.dataset.page = 'entering';
  announce('Opening the collection');
  // The same Kohaku must be present at its destination even after returning from a filter.
  window.dispatchEvent(new Event('mizu:prepare-collection'));
  if (!motion || !pond || pond.contextLost) { finishCatalog(push); return; }
  catalog.hidden = false;
  catalog.inert = true;
  catalog.classList.add('revealing', 'receiving');
  catalog.style.opacity = '0';
  canvas.classList.add('transport');
  const destination = $('[data-specimen="kohaku-01"] .sprite-window').getBoundingClientRect();
  pond.beginTransition({ x: destination.left + destination.width / 2, y: destination.top + destination.height * .46, length: destination.height }, TRANSITION_DURATION);
  let elapsed = 0, last = null;
  flightAbort = new AbortController();
  document.addEventListener('visibilitychange', () => { last = null; }, { signal: flightAbort.signal });
  const advance = stamp => {
    if (run !== sequence) return;
    if (last !== null && !document.hidden) elapsed += (stamp - last) / 1000;
    last = document.hidden ? null : stamp;
    if (!motion || pond.contextLost) { finishCatalog(push); return; }
    pond.setTransitionTime(elapsed);
    catalog.style.opacity = String(smoothstep((elapsed / TRANSITION_DURATION - .08) / .60));
    if (elapsed >= TRANSITION_DURATION) finishCatalog(push); else requestAnimationFrame(advance);
  };
  requestAnimationFrame(advance);
}

// A layout change must never land the live fish on an obsolete screen coordinate.
window.addEventListener('resize', () => {
  if (page === 'entering') { sequence++; finishCatalog(); }
});

$('#enter').addEventListener('click', () => enterCollection());
$$('.home-link').forEach(button => button.addEventListener('click', event => { event.preventDefault(); if (page !== 'pond') showPond(); }));
window.addEventListener('hashchange', () => {
  if (location.hash === '#enter' || location.hash === '#catalog-title') return;
  if (['#collection', '#offers', '#sell', '#saved'].includes(location.hash)) { sequence++; finishCatalog(false); }
  else showPond(false);
});

function updateMotion(enabled) {
  motion = enabled;
  document.body.classList.toggle('motion-paused', !motion);
  $('#motion-toggle').textContent = motion ? 'Motion on' : 'Motion off';
  $('#motion-toggle').setAttribute('aria-pressed', String(motion));
  pond?.setMotion(motion);
}
$('#motion-toggle').addEventListener('click', () => updateMotion(!motion));
reducedMedia.addEventListener('change', event => updateMotion(!event.matches));
updateMotion(motion);

let lastPointer = null;
canvas.addEventListener('pointerdown', event => {
  if (page !== 'pond' || !motion) return;
  const bounds = canvas.getBoundingClientRect();
  const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
  pond?.addRipple(x, y, 1.2);
  pond?.scareFish(x, y);
  lastPointer = { x, y, time: performance.now() };
});
canvas.addEventListener('pointermove', event => {
  if (!lastPointer || !event.buttons || page !== 'pond') return;
  const bounds = canvas.getBoundingClientRect();
  const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
  if (Math.hypot(x - lastPointer.x, y - lastPointer.y) > 20 && performance.now() - lastPointer.time > 70) {
    pond?.addRipple(x, y, .7);
    lastPointer = { x, y, time: performance.now() };
  }
});
window.addEventListener('pointerup', () => { lastPointer = null; });
window.addEventListener('pointercancel', () => { lastPointer = null; });

if (['#collection', '#offers', '#sell', '#saved'].includes(location.hash)) finishCatalog(false, false);
else { catalog.inert = true; setHash('#pond', true); }

Pond.create(canvas, fallback => {
  document.body.classList.toggle('graphics-fallback', fallback);
  canvas.style.visibility = fallback ? 'hidden' : '';
  if (fallback && page === 'entering') { sequence++; finishCatalog(); }
}).then(renderer => {
  pond = renderer;
  pond.setMotion(motion);
  pond.setActive(page === 'pond' || page === 'entering');
  document.body.classList.add('ready');
  $('#loading').hidden = true;
}).catch(error => {
  console.warn('Using the static pond presentation:', error.message);
  document.body.classList.add('graphics-fallback');
  $('#loading').textContent = '';
  canvas.style.visibility = 'hidden';
});
