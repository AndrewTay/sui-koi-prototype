// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-364
// source=packages/mizu-ui/src/marketplace.tsx
// component=EmptyState
import figma from 'figma'

const instance = figma.selectedInstance

const reason = instance.getEnum('Reason', { Saved: 'Saved', Results: 'Results' })
export default {
  example: figma.code`<EmptyState reason="${reason}" onAction={() => { /* Browse the collection or clear its filters. */ }} />`,
  imports: ['import { EmptyState } from "@mizu/ui"'], id: 'mizu-keynote-empty-state',
  metadata: { nestable: true, props: { reason } },
}
