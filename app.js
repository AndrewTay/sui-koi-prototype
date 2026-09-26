import { Pond } from './pond.js';
import { specimens, selectSpecimens, parseSaved, TRANSITION_DURATION, smoothstep } from './model.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const home = $('#home'), catalog = $('#catalog'), canvas = $('#pond');
const skipLink = $('.skip-link');
const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reducedMedia.matches;
let pond = null, page = 'pond', sequence = 0;
let filter = 'all', shortlistOnly = false, saved = new Set();
let returnFocus = null;
let flightAbort = null;
try { saved = parseSaved(localStorage.getItem('sui-shortlist')); } catch { /* Shortlisting still works in this tab when storage is blocked. */ }

function announce(message) { $('#announcer').textContent = message; }
function sprite(fish) {
  const art = fish.artwork;
  return `<span class="sprite-window" style="--sprite-index:${art.index};--sprite-columns:${art.columns};--sprite-aspect:${art.aspect}"><img src="${art.src}" alt="${fish.name} koi, viewed from above" loading="${fish.id === 'kohaku-01' ? 'eager' : 'lazy'}"></span>`;
}

function renderCatalog() {
  const filtered = selectSpecimens(filter, shortlistOnly, saved);
  $('#fish-grid').innerHTML = filtered.map(fish => `<article class="fish-card"><button class="specimen-open" data-specimen="${fish.id}" aria-label="View ${fish.name} ${fish.number}"><span class="fish-art"><span class="specimen-number">${fish.number}</span>${sprite(fish)}</span><span class="specimen-info"><span class="specimen-name" role="heading" aria-level="3">${fish.name}</span><span class="specimen-meta">${fish.size} <span aria-hidden="true"> / </span> ${fish.age}</span></span></button></article>`).join('');
  $('#empty-state').hidden = filtered.length > 0;
  $('#empty-state h3').textContent = saved.size && shortlistOnly ? 'No saved koi in this variety' : 'No koi saved';
  $('#shortlist-count').textContent = `(${saved.size})`;
  $('#shortlist-toggle').setAttribute('aria-pressed', String(shortlistOnly));
  $$('[data-filter]').forEach(button => { const selected = button.dataset.filter === filter; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected)); });
}

function saveSpecimen(id) {
  if (saved.has(id)) saved.delete(id); else saved.add(id);
  try { localStorage.setItem('sui-shortlist', JSON.stringify([...saved])); } catch { /* In-memory shortlist remains available. */ }
  renderCatalog();
  const button = $('#save-specimen');
  if (button) { button.textContent = saved.has(id) ? 'Saved to your shortlist ✓' : 'Save to your shortlist +'; button.setAttribute('aria-pressed', String(saved.has(id))); }
  announce(saved.has(id) ? 'Specimen saved to your shortlist' : 'Specimen removed from your shortlist');
}

function openSpecimen(id, trigger) {
  const fish = specimens.find(item => item.id === id);
  if (!fish) return;
  returnFocus = trigger;
  $('#specimen-content').innerHTML = `<div class="specimen-layout"><div class="specimen-portrait">${sprite(fish)}<span class="specimen-number">N° ${fish.number}</span></div><div class="specimen-details"><h2 id="specimen-title">${fish.name}</h2><p>${fish.description}</p><dl class="specimen-facts"><div><dt>Variety</dt><dd>${fish.name}</dd></div><div><dt>Length</dt><dd>${fish.size}</dd></div><div><dt>Age</dt><dd>${fish.age}</dd></div></dl><button id="save-specimen" class="save-button" aria-pressed="${saved.has(id)}">${saved.has(id) ? 'Saved to your shortlist ✓' : 'Save to your shortlist +'}</button></div></div>`;
  $('#save-specimen').addEventListener('click', () => saveSpecimen(id));
  $('#specimen-dialog').showModal();
}

$('#fish-grid').addEventListener('click', event => { const button = event.target.closest('[data-specimen]'); if (button) openSpecimen(button.dataset.specimen, button); });
$$('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; renderCatalog(); }));
$('#shortlist-toggle').addEventListener('click', () => { shortlistOnly = !shortlistOnly; filter = 'all'; renderCatalog(); });
$('#show-all').addEventListener('click', () => { shortlistOnly = false; filter = 'all'; renderCatalog(); });

$$('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  dialog.addEventListener('close', () => {
    const original = returnFocus;
    const replacement = original?.dataset.specimen ? document.querySelector(`[data-specimen="${original.dataset.specimen}"]`) : null;
    const target = original?.isConnected ? original : replacement || (page === 'catalog' ? $('#catalog-title') : $('#enter'));
    returnFocus = null;
    queueMicrotask(() => target?.focus({ preventScroll: true }));
  });
});
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
  document.title = 'The Collection — SUI';
  skipLink.href = '#catalog-title';
  skipLink.textContent = 'Skip to the collection';
  if (push) setHash('#collection');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) $('#catalog-title').focus({ preventScroll: true });
  announce('The collection with nine koi available to explore');
}

function showPond(push = true) {
  flightAbort?.abort();
  sequence++;
  page = 'pond';
  $$('dialog[open]').forEach(dialog => dialog.close());
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
  document.title = 'SUI — Koi for quiet ponds';
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
  filter = 'all';
  shortlistOnly = false;
  renderCatalog();
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
$$('.home-link,.back-to-pond').forEach(button => button.addEventListener('click', event => { event.preventDefault(); if (page !== 'pond') showPond(); }));
window.addEventListener('hashchange', () => {
  if (location.hash === '#enter' || location.hash === '#catalog-title') return;
  if (location.hash === '#collection') { sequence++; finishCatalog(false); }
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

window.addEventListener('storage', event => { if (event.key === 'sui-shortlist') { saved = parseSaved(event.newValue); renderCatalog(); } });

renderCatalog();
if (location.hash === '#collection') finishCatalog(false, false);
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
