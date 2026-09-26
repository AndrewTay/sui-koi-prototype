# SUI — Koi for quiet ponds

An interactive web prototype for a small fictional koi collection. Built for desktop and mobile with original generated artwork, an original WebGL renderer, and a functioning illustrative collection.

## Run

Requires a current Node.js release. No package installation or build step is needed.

```sh
npm start
```

Open http://127.0.0.1:4173. To use a different port in PowerShell:

```powershell
$env:PORT = '4180'
npm start
```

The preview server binds to the local computer only. Serve this folder with any static HTTP host to share it elsewhere. Opening `index.html` via `file://` is not supported because the browser must load JavaScript modules and image textures over HTTP.

## Experience

- One Kohaku explores the open water with continuous forward swimming. Its head leads a constrained, articulated spine; tail beats respond to speed.
- Tap or drag across the water to create expanding ripples.
- Only a touch near the fish triggers a startle. Speed and rotation build gradually, then settle into exploration. Repeated clicks update its steering intent without resetting its position, velocity, or heading.
- “Browse the collection” moves the same rendered Kohaku into the first collection card while the pond fades away. Position and initial velocity are continuous; the body settles into the same artwork and exact card dimensions over approximately 3.6 seconds. There is no spiral or circular page wipe.
- Explore nine illustrative specimens, filter by variety, open details, and save a shortlist. The shortlist persists in browser local storage, with an in-memory fallback if storage is unavailable.
- Return to the pond or turn motion off.
- Native browser Back/Forward and direct `#collection` navigation work.
- Reduced motion starts with a still pond and immediate catalog navigation. The manual motion control offers the same behavior.

## Design refinement

The concept combines a full-bleed living environment with restrained editorial typography. Deep jade, ivory, and a small vermilion accent establish the visual language. The interface gives the koi most of the attention. The collection is a quiet ivory gallery with specimen portraits, filters, dimensions, and details on demand.

The desktop and portrait pond artwork are independently composed so the garden remains visible at both aspect ratios. Mobile uses a smaller fish on a lower path to preserve the reading and interaction area.

The reusable visual and content rules are documented in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## Architecture

- `index.html`: semantic page structure, native dialogs, and controls.
- `styles.css`: responsive typography and layout, dialog presentation, and page transition treatment.
- `app.js`: navigation state, one coordinated entrance timeline, catalog interactions, persistence, motion controls, and accessibility behavior.
- `model.js`: catalog data, artwork mappings, interpolation helpers, and storage validation.
- `swimming.js`: persistent motion at 120 integration steps per second, bounded turn rate and acceleration, proximity testing, steering, constrained spine geometry, and the continuous gallery handoff.
- `pond.js`: native WebGL 2. The environment and articulated fish mesh are composed into a framebuffer. Analytic surface ripples refract that scene. During the handoff, background opacity and water effects diminish while the same fish remains rendered on a transparent canvas above the gallery. No rendering framework or third-party site code is included.
- `assets/`: six original PNG assets made with built-in Imagegen. The six added varieties now have distinct artwork in two additional sprite sheets. No recoloring filters remain. The first catalog Kohaku uses the same image as the swimming fish. Prompts and provenance are recorded in `ASSETS.md`.
- `server.mjs`: dependency-free local preview server.
- `tests/`: trajectory/data unit tests and HTTP integration tests.

The renderer stops when the pond is hidden or the document is inactive, caps pixel density, and can reduce resolution when frame times are high. It releases GPU resources and supports context restoration. Unsupported graphics use the image-backed still presentation; the collection remains usable.

## Validation

```sh
npm run check
npm test
```

See `TESTING.md` for the browser checks and their limits.

## Scope and architectural integrity

This is a completed visual and interaction prototype, not an operating fish dealership. SUI is fictional. All koi imagery and specimen measurements are illustrative. There is no checkout, seller integration, inventory backend, or enquiry submission.

The graphics are deliberately 2.5D: generated artwork, a deforming mesh, and analytic water effects. They are not a full fluid solver or a rigged anatomical 3D fish. This is an explicit rendering design, not a hidden workaround. A future freely moving camera or physically simulated water would require a different rendering scope.

The old stateless trajectory and touch-offset helpers were replaced by the stateful motion module; their only callers and tests were migrated. Artwork entries now identify their source file and sprite region instead of a recolor variant. There are no external API changes. These are deliberate internal changes, not compatibility shims. No structural block prevented completion. Real-device Safari/Android performance is not verified; browser checks and their scope are recorded in `TESTING.md`.
