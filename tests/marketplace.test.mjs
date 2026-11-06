import test from 'node:test';
import assert from 'node:assert/strict';
import { listings, initialThreads, restoreState, validateListing, submitOffer, handovers } from '../marketplace/state.js';

const validDraft = { title: 'Marudo Kohaku', variety: 'Kohaku', length: '52', price: '1650', location: 'Sonoma, CA', notes: 'Measured in a viewing bowl after indoor quarantine.', handover: handovers[0] };
test('listing validation rejects missing images, invalid values and invented varieties', () => {
  assert.deepEqual(validateListing(validDraft, 'image'), {});
  const errors = validateListing({ ...validDraft, price: '-1', length: 'Infinity', variety: 'unknown' }, '');
  assert.deepEqual(Object.keys(errors).sort(), ['image', 'length', 'price', 'variety']);
});
test('legacy saved specimens survive migration and unknown identifiers are removed', () => {
  assert.deepEqual(restoreState(null, ['kohaku-01', 'not-a-listing', 'kohaku-01']).saved, ['kohaku-01']);
  assert.equal(restoreState('broken').threads.length, initialThreads.length);
  assert.equal(restoreState('{"threads":[{"id":"bad"}]}').threads.length, 0);
});
test('submitting another offer updates one thread and preserves conversation history', () => {
  const original = structuredClone(initialThreads), item = listings[0];
  const threads = submitOffer(original, item, { amount: '2,300', handover: handovers[0], message: 'Saturday collection, please.' }, 'offer-test');
  assert.equal(threads.filter(thread => thread.listingId === item.id).length, 1);
  assert.equal(threads[0].amount, 2300);
  assert.equal(threads[0].status, 'Pending');
  assert.equal(threads[0].messages.length, original[0].messages.length + 1);
  assert.deepEqual(original, initialThreads);
  assert.deepEqual(restoreState(JSON.stringify({ custom: [], saved: [], threads })).threads, threads);
});
test('reserved specimens and invalid offers cannot overwrite an accepted agreement', () => {
  const reserved = listings.find(item => item.id === 'goshiki-06');
  assert.throws(() => submitOffer(initialThreads, reserved, { amount: '1700', handover: handovers[0], message: 'Offer' }), /reserved/);
  assert.throws(() => submitOffer(initialThreads, listings[0], { amount: '-10', handover: handovers[0], message: 'Offer' }), /Check/);
  assert.throws(() => submitOffer(initialThreads, listings[0], { amount: '100', handover: 'unknown', message: 'Offer' }), /Check/);
});
test('saved custom listings survive reload and malformed uploaded data is rejected', () => {
  const custom = { id: 'custom-example', name: 'Kohaku', title: 'Marudo Kohaku', variety: 'Kohaku', size: '52 cm', price: 1650, location: 'Sonoma, CA', description: 'Healthy specimen with quarantine history.', number: '10', image: 'data:image/png;base64,aW1hZ2U=', fulfilment: [handovers[0]] };
  assert.deepEqual(restoreState(JSON.stringify({ custom: [custom], saved: [custom.id], threads: [] })).saved, [custom.id]);
  assert.equal(restoreState(JSON.stringify({ custom: [{ ...custom, image: 'javascript:alert(1)' }], saved: [custom.id], threads: [] })).custom.length, 0);
});
