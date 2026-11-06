// url=https://www.figma.com/design/BudoJIcMQdoMoZqgKr1lzD/mizu---Collector-s-Marketplace?node-id=16-347
// source=packages/mizu-ui/src/marketplace.tsx
// component=ImageUpload
import figma from 'figma'

const instance = figma.selectedInstance
const state = instance.getEnum('State', {
  Empty: 'Empty',
  Selected: 'Selected',
  Error: 'Error',
  Uploading: 'Uploading',
})

export default {
  example: figma.code`<ImageUpload state="${state}" />`,
  imports: ['import { ImageUpload } from "@mizu/ui"'],
  id: 'mizu-image-upload',
  metadata: { nestable: true },
}
