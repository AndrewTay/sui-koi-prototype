// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-181
// source=packages/mizu-ui/src/media.tsx
// component=MediaKoi
import figma from 'figma'

const alt = "Koi, viewed from above"
export default {
  example: figma.code`<MediaKoi alt={${JSON.stringify(alt)}} />`,
  imports: ['import { MediaKoi } from "@mizu/ui"'], id: 'mizu-keynote-media-koi',
  metadata: { nestable: true, props: { kind: 'Koi', alt } },
}
