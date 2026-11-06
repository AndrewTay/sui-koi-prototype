// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=13-254
// source=packages/mizu-ui/src/controls.tsx
// component=StatusBadge
import figma from 'figma'

const instance = figma.selectedInstance

const status = instance.getEnum('Status', { Counter: 'Counter', Reserved: 'Reserved', Pending: 'Pending', Closed: 'Closed' })
// The Figma amount text includes its visual separator; React supplies the spacing.
const amount = instance.getString('Amount').replace(/^\s*·\s*/, '')
const showAmount = instance.getBoolean('Show amount')
export default {
  example: figma.code`<StatusBadge status="${status}" amount={${JSON.stringify(amount)}} showAmount={${String(showAmount)}} />`,
  imports: ['import { StatusBadge } from "@mizu/ui"'], id: 'mizu-keynote-status-badge',
  metadata: { nestable: true, props: { status, amount, showAmount: String(showAmount) } },
}
