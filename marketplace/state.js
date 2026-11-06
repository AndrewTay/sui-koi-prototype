import { specimens } from '../model.js';
import reference from './reference-data.json' with { type: 'json' };

export const listings = specimens.map(item => ({ ...item, ...reference.details.find(detail => detail.id === item.id) }));
export const sellers = reference.sellers;
export const departments = reference.departments;
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export const varieties = [...new Set(specimens.map(item => item.variety))];
export const initialThreads = reference.threads;
export const handovers = ['Pondside Collection', 'Specialist Oxygenated Courier'];
export const storageKey = 'mizu-marketplace-v1';

export function validateListing(value, image) {
  /** @type {Record<string, string>} */
  const errors = {};
  if (value.title.trim().length < 5) errors.title = 'Enter a descriptive title of at least 5 characters.';
  if (!varieties.includes(value.variety)) errors.variety = 'Choose a variety.';
  if (!Number.isFinite(Number(value.length)) || Number(value.length) < 10 || Number(value.length) > 120) errors.length = 'Enter a length from 10 to 120 cm.';
  if (!Number.isFinite(Number(value.price)) || Number(value.price) < 50 || Number(value.price) > 100000) errors.price = 'Enter a price from $50 to $100,000.';
  if (value.location.trim().length < 3) errors.location = 'Enter a city and region.';
  if (value.notes.trim().length < 20) errors.notes = 'Add at least 20 characters about condition and holding history.';
  if (!value.handover) errors.handover = 'Choose a handover arrangement.';
  if (!image) errors.image = 'Add a photograph of this specimen.';
  return errors;
}

// Persist only data the UI can safely render. Reject malformed or stale records.
export function restoreState(raw, legacySaved = []) {
  let value;
  try { value = JSON.parse(raw); } catch { value = null; }
  const custom = Array.isArray(value?.custom) ? value.custom.filter(item =>
    item && typeof item.id === 'string' && item.id.startsWith('custom-') &&
    ['name', 'title', 'variety', 'size', 'location', 'description', 'number'].every(key => typeof item[key] === 'string') &&
    Number.isFinite(item.price) && item.price >= 50 && typeof item.image === 'string' && /^data:image\/(png|jpeg);base64,/.test(item.image) &&
    Array.isArray(item.fulfilment) && item.fulfilment.every(x => handovers.includes(x))) : [];
  const ids = new Set([...listings, ...custom].map(item => item.id));
  const saved = (Array.isArray(value?.saved) ? value.saved : legacySaved).filter(id => ids.has(id));
  const threads = Array.isArray(value?.threads) ? value.threads.filter(thread =>
    thread && typeof thread.id === 'string' && ids.has(thread.listingId) && ['Counter', 'Pending', 'Reserved'].includes(thread.status) &&
    Number.isFinite(thread.amount) && thread.amount > 0 && typeof thread.handover === 'string' &&
    Array.isArray(thread.messages) && thread.messages.every(message => message && ['id', 'text', 'time'].every(key => typeof message[key] === 'string') && typeof message.sent === 'boolean')) : structuredClone(initialThreads);
  return { custom, saved: [...new Set(saved)], threads };
}

export function submitOffer(threads, listing, value, id = crypto.randomUUID()) {
  const amount = Number(value.amount.replaceAll(',', ''));
  if (!Number.isFinite(amount) || amount <= 0 || !handovers.includes(value.handover) || !value.message.trim()) throw new Error('Check the offer amount, handover and message.');
  const existing = threads.find(thread => thread.listingId === listing.id);
  if (existing?.status === 'Reserved') throw new Error('This specimen is already reserved.');
  const message = { id, text: `${value.message.trim()} (Offer: ${money(amount)} · ${value.handover})`, sent: true, time: 'Just now' };
  const next = { id: existing?.id || `thread-${id}`, listingId: listing.id, unread: false, status: 'Pending', amount, handover: value.handover, messages: [...(existing?.messages || []), message] };
  return [next, ...threads.filter(thread => thread.id !== existing?.id)];
}
