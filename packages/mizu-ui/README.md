# Mizu UI

Reusable React components for the [Mizu collector marketplace Components page](https://www.figma.com/design/BudoJIcMQdoMoZqgKr1lzD/mizu---Collector-s-Marketplace?node-id=1-6625). The package sits beside the older static koi prototype, so that prototype remains runnable while a React consumer adopts the library.

## Use

```tsx
import '@mizu/ui/tokens.css';
import '@mizu/ui/styles.css';
import { Button, ImageUpload, SpecimenCard } from '@mizu/ui';

function Listing() {
  return <section>
    <SpecimenCard title="Kohaku" metadata="54 cm · $2,400" onClick={() => {}} />
    <ImageUpload onFileSelect={async file => { /* send file to your API */ }} />
    <Button label="Make an offer" onClick={() => {}} />
  </section>;
}
```

Install this package into a React 18.3+ application through the repository's package manager. `npm run build` produces ES modules, declarations, CSS, and the original Figma assets in `dist`. `npm run demo` opens an interactive component gallery. `npm run typecheck` validates both React code and parserless Code Connect templates; `npm test` covers upload and form recovery paths.

The Figma variable export in `tokens/figma.json` is the token source. Run `npm run tokens` after changing it. Components consume semantic variables such as `--sui-surface-raised` and `--sui-text-primary`. `:root` uses Gallery mode; add `data-mizu-theme="pond"` to an ancestor for the contextual Pond palette. Pond is intended for immersive regions rather than a complete product dark theme. The Figma export assigns the same WEB syntax to the focus border *color* and *width*; the generated CSS calls the width `--sui-border-focus-width` to keep both values available.

## Component inventory

| Family | Exports | Figma variant or property mapping |
| --- | --- | --- |
| Icons | `Icon`, `IconClose`, `IconPlus`, `IconChevron`, `IconDown`, `IconMenu`, `IconUpload`, `IconCheck`, `IconSpinner` | Original 20px SVG artwork; semantic icon color |
| Action controls | `Button`, `IconButton` | Appearance, State, Label, optional Icon; accessible name for icon button |
| Navigation | `NavigationItem`, `FilterTab`, `Header`, `DepartmentAccordion` | Selected/current, Count, Expanded, Viewport |
| Forms | `Field`, `ImageUpload`, `MessageComposer`, `OfferForm` | Kind, State, validation and recovery states |
| Status | `StatusBadge`, `EmptyState` | Status/Amount and Reason |
| Media | `MediaKoi`, `MediaCeramic`, `MediaBonsai`, `Media` | Original content images, alt text |
| Marketplace | `Brand`, `SpecimenCard`, `FactRow`, `SpecimenDetails`, `OfferSummary`, `Message`, `Dialog` | Layout, media swap, Direction, Viewport and body composition |

Together these cover the 30 published assets on the Components page: 8 icons, 3 media assets, and 19 UI families. React uses native controls and semantic markup; Figma's visual `Focus`, `Hover`, and `Pressed` variants are available through `state` for documentation, while normal pseudo states work without setting them.

## Usage decisions

- Use `NavigationItem` for routes (`aria-current`), `FilterTab` for in-page choices (`aria-pressed`), and `DepartmentAccordion` for disclosures (`aria-expanded`).
- Keep one interactive target per `SpecimenCard`. Supply approved media through `media` or `mediaKind`; use meaningful alt text. Long titles and metadata reflow.
- Provide real prices, seller details, status and provenance from application data. `StatusBadge` is a display state; it is not a payment or reservation workflow.
- Pass actual API handlers to `ImageUpload`, `MessageComposer`, and `OfferForm`. They validate inputs, announce errors, preserve failed drafts, and prevent duplicate pending submissions. The package does not implement backend uploads or offers.
- `Dialog` uses native modal behavior, Escape dismissal, scroll locking, and focus return. Supply an accessible `title`, body, and close handler.
- Keep controls at least 44px tall, maintain visible focus, and test composed flows with keyboard and assistive technology in the consuming product.

## Code Connect

`code-connect/*.figma.ts` contains parserless templates for Image upload, Button, Empty state and the nested icon assets used by those components. Empty state maps Figma's `Reason` to `EmptyState.reason` for both `Saved` and `Results`; the consuming app supplies `onAction`. Their `url`, `source`, properties and generated snippets can be validated with:

```sh
npx figma connect parse --skip-update-check --outFile /tmp/mizu-code-connect.json
```

`code-connect/demo/` targets the separate DEMO marketplace file (`Cc9wVOVG4ZSCgga5DfNs5w`) for Empty state and its nested Button. The original file's templates remain at the top level. The recursive include pattern validates both destinations.

`code-connect/keynote/` contains the complete set of 30 published, executable templates for **MIZU | SC Keynote** (`vzZcV01fYoCl3eGZylJHha`), verified through Figma readback on 6 November 2026. See [the keynote coverage and gap report](code-connect/keynote/README.md) before publishing. `npm run codeconnect:check` parses the scoped set, evaluates it against captured Figma variants and overrides, and typechecks the emitted JSX against this package.

To publish full snippets to Figma from the CLI, configure a Figma access token in your environment and use `npx figma connect publish`. Do not commit the token. If a source-only mapping with the same node and label conflicts, the CLI supports `--force` to replace it with the full template.

Use `npm run codeconnect:publish:keynote` to publish only the keynote destination, leaving the older files out of that operation.
