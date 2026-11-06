// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-191
// source=packages/mizu-ui/src/marketplace.tsx
// component=Brand
import figma from 'figma'

const instance = figma.selectedInstance

const size = instance.getEnum('Size', { Desktop: 'Desktop', Mobile: 'Mobile' })
export default {
  example: figma.code`<Brand size="${size}" href="#pond" />`,
  imports: ['import { Brand } from "@mizu/ui"'], id: 'mizu-keynote-brand',
  metadata: { nestable: true, props: { size, href: '#pond' } },
}
