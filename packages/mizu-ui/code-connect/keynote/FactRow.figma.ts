// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-235
// source=packages/mizu-ui/src/marketplace.tsx
// component=FactRow
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const value = instance.getString('Value')
export default {
  example: figma.code`<FactRow label={${JSON.stringify(label)}} value={${JSON.stringify(value)}} />`,
  imports: ['import { FactRow } from "@mizu/ui"'], id: 'mizu-keynote-fact-row',
  metadata: { nestable: true, props: { label, value } },
}
