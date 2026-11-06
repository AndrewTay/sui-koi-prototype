// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-183
// source=packages/mizu-ui/src/media.tsx
// component=MediaCeramic
import figma from 'figma'

const alt = "Blue and white ceramic vase"
export default {
  example: figma.code`<MediaCeramic alt={${JSON.stringify(alt)}} />`,
  imports: ['import { MediaCeramic } from "@mizu/ui"'], id: 'mizu-keynote-media-ceramic',
  metadata: { nestable: true, props: { kind: 'Ceramic', alt } },
}
