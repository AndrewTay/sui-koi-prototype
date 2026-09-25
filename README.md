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

- One Kohaku swims through a jade garden pond. Its body, tail, and fins deform continuously.
- Tap or drag across the water to create expanding ripples.
- Click the pond and the koi moves away from the touch point with a short directional burst before returning to its path.
- “Browse the collection” carries the same fish through a broad banking arc that follows its current heading, then accelerates into the reveal. Water distortion increases before an expanding circular reveal opens the collection. The sequence is approximately 3.4 seconds in a visible, normally scheduled tab.
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
- `model.js`: pure fish trajectories, interpolation, catalog data, and storage validation.
- `pond.js`: native WebGL 2. An image-backed environment and a subdivided fish mesh are composed into a framebuffer. A second pass applies animated caustics, analytic ripple displacement, and subtle transition swirl. No rendering framework or third-party site code is included.
- `assets/`: four original images made with built-in Imagegen. The six additional collection entries use deliberate palette treatments of the existing catalog sprite so the prototype remains self-contained while bespoke asset generation is unavailable. Prompts and file provenance are recorded in `ASSETS.md`.
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

No known fragile implementation shortcuts remain in the tested flow. Native dialogs, direct state handling, bounded GPU resources, and deterministic trajectories keep the implementation self-contained. Browser/real-device performance beyond the tested desktop Chrome environment remains unverified. No existing APIs were changed or broken; this is a new standalone project. No structural block prevented completion.
