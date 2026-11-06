// url=https://www.figma.com/design/BudoJIcMQdoMoZqgKr1lzD/mizu---Collector-s-Marketplace?node-id=16-364
// source=packages/mizu-ui/src/marketplace.tsx
// component=EmptyState
import figma from 'figma'

const instance = figma.selectedInstance
const reason = instance.getEnum('Reason', {
  Saved: 'Saved',
  Results: 'Results',
})

export default {
  example: figma.code`<EmptyState reason="${reason}" />`,
  imports: ['import { EmptyState } from "@mizu/ui"'],
  id: 'mizu-empty-state',
  metadata: { nestable: true },
}
