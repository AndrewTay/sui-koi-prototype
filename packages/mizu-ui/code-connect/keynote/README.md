# MIZU keynote Code Connect

Target: [MIZU | SC Keynote — Components](https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=1-6625).

Verified 6 November 2026: **30 of 30 component families have published, executable React templates**, covering all **92 variants and standalone components**. All 30 have parserless `.figma.ts` templates in this directory. Older source-file and DEMO mappings remain separate.

## Publication status

**All 30 full executable templates are now hosted in Figma.** The CLI validated and uploaded the scoped set with `--force`, replacing the source-only React mappings. Figma readback returned 164 component/instance records, all with `hasTemplate: true` and generated snippets. Every one of the 92 captured variant/standalone IDs is covered. Additional hosted checks confirmed nested media in SpecimenCard, the OfferForm body in Dialog, and both Header viewports.

The temporary token file used for this upload was deleted after verification. For a future publication, configure `FIGMA_ACCESS_TOKEN` in your own shell and run:

```sh
cd packages/mizu-ui
npm run codeconnect:check
npm run codeconnect:publish:keynote
```

Do not commit or paste the token into the repository. If future source-only React connections conflict with these templates, append `-- --force` to the publish command to replace those specific mappings. Recheck `hasTemplate` and generated snippets after publishing.

`figma.keynote.config.json` scopes the publish operation to these 30 files. The main `figma.config.json` still includes all 38 templates across all three destinations.

## Inventory

| Group | Code components |
| --- | --- |
| Actions and status | Button, IconButton, StatusBadge |
| Brand and navigation | Brand, Header, NavigationItem, FilterTab, DepartmentAccordion |
| Forms and input | Field, ImageUpload, OfferForm |
| Icons | IconClose, IconPlus, IconChevron, IconDown, IconMenu, IconUpload, IconCheck, IconSpinner |
| Media | MediaKoi, MediaCeramic, MediaBonsai |
| Collection and details | SpecimenCard, FactRow, SpecimenDetails, EmptyState |
| Conversations and overlays | Message, OfferSummary, MessageComposer, Dialog |

Generic `Icon` and `Media` are implementation helpers; the Figma assets map to their eight and three concrete exports. There are no remaining missing code implementations in this inventory.

## Property and implementation gaps

| Area | Template behavior | Remaining application/design work |
| --- | --- | --- |
| IconButton accessible name | Derives a generic action label from the swapped icon's template metadata. | Figma has no accessible-label property. Supply a contextual `label`; the same icon can mean different actions. |
| Media alt text | Uses a descriptive default for each of the three supplied assets. | Figma has no alt-text property. Supply contextual alt text when content changes. |
| Navigation destinations | Header and NavigationItem recognize the four current app routes: `#collection`, `#offers`, `#sell`, `#saved`. Brand uses `#pond`. | Figma has no route property. Unknown labels, including department items, emit explicit `#replace-route-N` placeholders; replace these with application routing. |
| Field select options | Emits the currently visible selection as one valid option. | Figma does not define the full option list. Supply it from application data. |
| Field placeholder/value | Treats the default text input's displayed value as its placeholder; other states use `defaultValue`. | Figma uses one Value property for placeholder and entered data. Split these properties if both need independent design control. |
| OfferForm content | Reads the nested Field templates and parses the visible `Asking … · …` summary into price, specimen and reference. Uses the visible handover as one option. | Price, specimen, reference and currency are not separate Figma properties. Keep the summary format or expose semantic properties; supply the complete handover choices in the app. |
| SpecimenDetails content | Reads actual text layers and nested FactRow metadata, including overrides. | No top-level text properties are exposed. Renaming the referenced layers requires updating the template. |
| Nested configuration | Swappable media, icons and dialog bodies resolve via `executeTemplate()`. Nested navigation, facts and fields expose metadata for their data-driven parent APIs. | Header's Brand/menu, EmptyState's copy/action, and form internals are owned by the corresponding code components. Arbitrary nested visual overrides without a matching code prop cannot round-trip. |
| Interaction callbacks | Required callbacks are explicit commented stubs. Figma state variants are emitted as preview states. | Wire callbacks to app state and services. Omit controlled preview-state props when using a component's internal state. No backend or business behavior is created by Code Connect. |

All exposed Figma properties have a template read. No unsupported code props are emitted. Strings use JSX string expressions so quotes, newlines and non-Latin text remain valid. Component-owned child UI is not duplicated in parent snippets.

## Validation evidence and limits

- `context.json`: property definitions and descendant metadata read from this Figma file.
- `fixtures.json`: captured component/variant trees and nested overrides used by the local evaluator. Root component property defaults are synthesized from their owner's definitions; nested instances carry concrete Figma property values.
- `live-status.json`: verified source and full-template publication coverage for the target file.
- `npm run typecheck`: source and template TypeScript validation.
- `npm run codeconnect:check`: official CLI parser, coverage of 30 templates and all exposed properties, 92 captured variants/standalone components, five additional override scenarios (visible icon with escaped text, three media swaps, swapped dialog body), and typechecking of emitted JSX against current component interfaces.

The local evaluator implements only the Figma template APIs used here. Its passing result proves local template/property/code compatibility for those snapshots; the separate Figma readback establishes hosted publication and generated snippets. Neither check establishes rendering parity or service behavior. These snapshots must be refreshed if the design properties or layer names change.
