# Validation — 26 September 2026

## Automated checks

Run `npm run check` and `npm test` from this folder.

The test suite covers:

- Nearby versus distant touch handling
- Repeated clicks preserving position, heading, velocity, and turn rate
- Forward motion, turn-rate limits, and angular-acceleration limits
- Startle acceleration and subsequent deceleration
- Three-minute motion runs with repeated touches at five viewport sizes
- Fixed spine segment lengths and bounded curvature during tight turns
- Equivalent trajectories at 30, 60, and 120 render frames per second
- Exact initial pose/spine and final card position during the gallery handoff
- Initial velocity continuity and zero terminal velocity
- Resize remapping, filters, shortlist validation, and unique artwork regions
- HTTP status, browser MIME types, every referenced artwork file, and path traversal rejection

## Browser checks

Verified in Chrome and the Codex Chromium preview:

- Pond and fish shaders compile without errors
- All nine koi render, including six newly generated, distinct varieties
- Desktop gallery and mobile layout at 390 × 844
- Mobile horizontal overflow is absent
- Near-fish click input and collection entry
- The animated fish remains visible during entry while the first card's copy is hidden
- The first card becomes visible and the animation canvas hides on completion
- Same Kohaku image is used by the pond and first card
- New Tancho details, shortlist save, and Escape dismissal
- Focus returns to the originating card after dialog dismissal
- Motion-off entry goes directly to the collection with focus on its heading
- Resizing during entry completes the route and releases its inert state

## Limits

The motion tests validate geometry and continuity; they are not a claim of biological simulation. Artwork is generated and specimen measurements remain illustrative. Physical iOS/Android devices, Safari, forced GPU context-loss recovery, and screen-reader testing were not performed. The in-app browser's screenshot crop helper sometimes returned a transient mis-scaled capture; viewport screenshots and DOM layout measurements were used to verify the actual layout.

## Body-stutter investigation and fix

The old articulated spine reconstructed every joint from a distance-sampled head trail on each render. A newly selected trail segment could change the target tangent abruptly; constraining curvature did not constrain that change over time. A three-minute, 60 Hz simulation reproduced large tail jumps while the fish centre barely moved.

| Viewport | Largest joint movement before | After | Frames above 4% of fish length, before / after |
| --- | ---: | ---: | ---: |
| 1440 × 900 | 25.56 px | 2.48 px | 150 / 0 |
| 929 × 861 | 21.60 px | 1.55 px | 235 / 0 |
| 390 × 844 | 19.79 px | 1.40 px | 446 / 0 |

At the worst desktop jump, the centre moved only 0.34 px. This identifies deformation discontinuities rather than excessive swimming speed as the primary reproduced fault.

The replacement stores joint angles and angular velocities, uses critically damped parent-following joints, and preserves the existing curvature and segment-length constraints. Rendering interpolates the previous and current physics states, including the joints and tail phase, instead of displaying quantized 120 Hz steps. The collection handoff begins from that exact interpolated frame. Its timeline is now the sole render driver during entry, eliminating duplicate animation loops.

Three added regression tests cover per-frame joint displacement, interpolated rendering at 144 Hz and uneven frame intervals, and exact handoff continuity from an interpolated frame. All 21 automated tests pass.

The optional browser harness at `/tests/render-benchmark.html` runs the actual renderer. In the Codex Chromium preview at 1280 × 720, after 90 warm-up frames, a 180-frame sample reported 100 fps average, 10.0 ms median, 10.1 ms p95, and zero intervals over 33.4 ms. This is a measurement of this browser session, not a device-wide performance guarantee. The refreshed live pond, click input, and collection handoff also completed without browser errors.
