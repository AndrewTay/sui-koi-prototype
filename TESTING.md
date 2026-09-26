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
