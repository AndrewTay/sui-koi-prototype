# Mizu — Living Jewels

An interactive collector marketplace with a WebGL koi pond, a curated collection, specimen details, saved items, offer conversations, and local listing creation.

## Run

Requires a current Node.js release. Install the existing component package's dependencies once:

```sh
npm --prefix packages/mizu-ui install
npm start
```

Open http://127.0.0.1:4173. `npm start` builds the React marketplace before starting the static preview server. For live source updates, stop the preview server and run `npm run dev` (Vite, same port). `npm run build:marketplace` refreshes the static bundle independently.

## Experience

- The original articulated koi, touch ripples, reduced-motion behavior, and continuous pond-to-card transition remain in place.
- Collection cards now show prices; details include the seller, breeder, quarantine notes and handover arrangements from the supplied Figma prototype. A calibrated grid can be toggled on the portrait.
- Collection, Offers, Sell and Saved have direct hash routes and support browser Back/Forward.
- Saved items, offer messages, counteroffers, reservations and custom listings persist locally. Existing SUI or Mizu shortlists are migrated. Storage failures are reported without blocking the current tab.
- Offer forms validate amounts, handover and messages. The sample counteroffer can be accepted; reserved offers cannot be overwritten. New messages do not fabricate automated seller replies.
- Sell validates specimen data and requires a readable PNG/JPG up to 2 MB. Custom listings use their own photograph and do not invent age, certification or quarantine information.
- The department drawer uses a visible keyboard-accessible menu, native modal focus containment, Escape dismissal and library accordions. Other departments are previews using the source prototype's remote listing photos; unavailable photos show an explicit fallback.
- Reset demo restores the initial sample state and offers Undo until the next reload.

The marketplace is a local interactive prototype. No seller receives these messages or offers, no listing is published to a service, and no payment or real reservation occurs.

## Figma import decisions

The source was the user-exported **Mizu App** Code Layer (`Cc9wVOVG4ZSCgga5DfNs5w`, `2012:988`). It was reviewed as a reference, not installed over the repository. Selected listing/seller/conversation data lives in `marketplace/reference-data.json`; UI and state handling were implemented separately.

The marketplace composes the existing `packages/mizu-ui` Header, SpecimenCard, SpecimenDetails, FilterTab, EmptyState, Dialog, OfferForm, Message, MessageComposer, ImageUpload, Field, Button and department components. It reuses their semantic tokens and original icon SVGs. The six exported pond/koi images are byte-identical to the existing assets, so no image replacement was necessary. Inter is served locally from the font source referenced in the export.

The pond retains its tested steering, fixed-step simulation and continuous collection handoff. Selected updates add stroke/glide/hold pacing, independent fin motion, softer submerged lighting and quieter wakes. The pond UI also adopts the export's glass controls, safe-area spacing and responsive type; the original local images provide the loading and WebGL fallback presentation. The reference's runtime/deployment files, duplicated component styles, synthetic reply timers, false transport/certification defaults for user-created listings and unrelated infrastructure were not imported.

## Reconciliation with the supplied MIZU folder (6 November 2026)

The separately supplied MIZU folder is a vanilla JavaScript implementation, not a drop-in update to this React marketplace. This repository remains the working version.

| Area | This project | Supplied MIZU |
| --- | --- | --- |
| Marketplace | React with reusable `packages/mizu-ui` components | HTML and DOM rendering in `app.js` |
| State | Saved items, listings and offer conversations persist locally | Shortlist persists; listings and conversations are held in memory |
| Navigation | Direct collection, offers, sell and saved hash routes | Collection/pond hashes with internal section switching |
| Presentation | Component-library typography and layout | Separate editorial styling and richer seller/sample content |
| Pond | Stroke/glide/hold pacing, independent fins, quieter wakes | Earlier motion implementation and initialization timeout fallback |
| Assets | Same six PNG images plus a local font | Same six PNG images |

The broken development collection was caused by Vite resolving the compiled marketplace before the source-entry plugin. The HTML removed the compiled stylesheet, while the source CSS imports never loaded. The plugin now runs before normal resolution and handles both relative and root-relative bundle URLs. A development-server regression test checks that the source entry and all three stylesheets load. Static builds continue to use `marketplace-dist/`.

No files from the supplied folder were copied over this project. Its simulated seller replies and different state/navigation model were not merged. Both folders pass their existing checks; this project's additional regression test covers the development-only failure.

## Architecture

- `marketplace/main.tsx`: React page composition and event handling.
- `marketplace/state.js`: validation, migration, serialization and offer transitions.
- `marketplace/styles.css`: responsive screen layout over the existing component library.
- `marketplace/vite.config.mjs`: static marketplace bundle; root `vite.config.mjs` supplies live development.
- `marketplace-dist/`: generated browser bundle, CSS and component assets. Rebuild after source edits before using the static server.
- `app.js`: pond lifecycle, motion controls, routes and the coordinated entrance timeline. A small DOM-event boundary prepares the React collection before the koi lands in its first card.
- `index.html` and `styles.css`: pond shell and original sprite geometry.
- `model.js`: original koi artwork and motion helpers.
- `pond.js` and `swimming.js`: original WebGL renderer and deterministic motion.
- `packages/mizu-ui/`: reusable React components and design tokens, with its own gallery and tests.
- `server.mjs`: local static preview, including correct SVG and font MIME types.

## Validation

```sh
npm run build:marketplace
npm run typecheck
npm run check
npm test
npm --prefix packages/mizu-ui test
```

Browser validation covered the pond handoff, collection, specimen details/grid, saved state, offer validation/submission, messages, counteroffers, acceptance, listing validation/upload/publishing, reload persistence, department navigation, and desktop/mobile layouts. See `TESTING.md` for the original renderer's verification limits.
