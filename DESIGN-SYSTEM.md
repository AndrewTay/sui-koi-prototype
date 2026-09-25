# SUI design system

SUI is a small koi catalogue with a living pond as its entry point. The pond supplies atmosphere and motion; the catalogue supplies useful information. The fish stay the focus.

## Design principles

1. **Specific before poetic**

   Use variety, size, age, pattern, and interaction labels. Avoid grand claims, invented provenance, and mood language that does not help someone understand the koi.

2. **One clear action**

   The pond has one primary action: `Browse the collection`. Secondary controls exist only when they change the experience, such as `Motion on` or `Back to the pond`.

3. **Motion has a reason**

   The idle fish follows a loose figure-eight. A click within the fish’s nearby touch radius creates a damped directional flee response with a gradual build-up and settle. The entrance continues its current heading through one banking arc before accelerating into the collection. Decorative motion should not compete with the fish.

4. **Facts carry the catalogue**

   Cards expose name, size, and age. Details add variety and a short visual description. Every specimen is illustrative and must not imply live inventory, provenance, or price.

5. **Remove decoration before adding more**

   Do not add ornamental Japanese characters, badges, gradients, labels, or microcopy unless they communicate something useful.

## Tokens

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `--sui-pond` | `#173e37` | Pond base and dark surfaces |
| `--sui-pond-deep` | `#071d19` | Pond shade and overlays |
| `--sui-ivory` | `#f4f1e8` | Light text and catalogue background |
| `--sui-ink` | `#23372f` | Catalogue text |
| `--sui-muted` | `#757e72` | Supporting text and metadata |
| `--sui-accent` | `#bc4e34` | Small vermilion accent and active filter |
| `--sui-line` | `rgba(35,55,47,.16)` | Catalogue rules |

The original legacy variables map to the same palette: `--ivory`, `--ink`, `--muted`, `--red`, and `--line`.

### Typography

- Display face: `Kokuryu`, then `Shingo`, then local `Yu Gothic`, `Noto Serif SC`, and a serif fallback
- Interface face: `Shingo`, then local `Yu Gothic`, `Noto Sans SC`, and an Arial fallback
- Kokuryu and Shingo are preferred when installed; the prototype currently falls back to the locally available Japanese system fonts
- Hero headline: `clamp(72px, 7.5vw, 124px)` on desktop, reduced at mobile breakpoints
- Catalogue title: `clamp(55px, 5.3vw, 82px)`
- Card name: `27px` desktop, `29px` mobile
- Metadata and controls: `9px–12px`, with letter spacing used sparingly

Use display typography for the small number of hierarchy-defining titles. Use the body face for controls, filters, measurements, and accessibility text. Use `em` for semantic emphasis only; it never changes the text to italics.

### Space and shape

- Base spacing: `8px`
- Common steps: `16px`, `24px`, `40px`, `64px`
- Card corners: nearly square (`2px`)
- Interactive controls: squircle radius `16px`
- Focus ring: `2px` outline with `5px–7px` offset

## Components

### Brand lockup

`SUI` is lowercase in the mark and stands alone. Keep the lockup quiet and do not add a slogan or inventory label beside it.

### Primary button

The pond CTA uses `.enter-button`:

- sentence case label
- `16px` squircle corners
- translucent ivory fill over the pond
- thin ivory border
- small line that extends on hover
- visible focus state

Use one primary button per surface. Do not pair it with another equivalent browse action.

### Motion toggle

The motion toggle is a small text control in the pond footer. It must remain available when reduced motion is preferred and must update `aria-pressed`.

### Variety filters

Filters are a single horizontally scrollable row. The active variety uses the vermilion underline. Keep labels to variety names and show the total only on `All koi`.

### Fish card

Each card is a button with:

- specimen number
- one fish image
- variety name
- size and age

The entire card opens details. Avoid a second “view” label or decorative arrow when the card itself is clearly interactive.

### Specimen dialog

The dialog contains the fish, name, variety, length, age, one factual description, and the shortlist action. Keep the close control keyboard accessible and return focus to the originating card.

## Layout

- Pond: full viewport with the fish in open water and copy kept in the darker area
- Catalogue: ivory background, `7%` side margins, three-column grid on desktop
- Mobile: one-column grid, horizontal filter row, stacked dialog layout
- Keep the catalogue title and first filter close enough to establish the page without a second introductory paragraph

## Motion and performance

- Idle motion is paused when the pond is hidden or the document is inactive
- Reduced motion starts with a still pond and skips the entrance timeline
- The entrance sequence lasts about `3.4s`
- Rendering uses bounded GPU resources and a lower pixel-density fallback

## Content rules

- Prefer concrete nouns and measurable details
- Avoid “living jewels”, “a slower kind of beautiful”, “nature with nothing to prove”, “atelier”, and similar prestige filler
- Do not invent prices, provenance, availability, sellers, or care claims
- Keep catalogue copy free of ornamental punctuation and unnecessary full stops
- Mark illustrative data in documentation rather than in every card
