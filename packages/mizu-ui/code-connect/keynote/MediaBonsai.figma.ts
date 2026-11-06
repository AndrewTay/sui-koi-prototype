// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-185
// source=packages/mizu-ui/src/media.tsx
// component=MediaBonsai
import figma from 'figma'

const alt = "Bonsai tree in a shallow pot"
export default {
  example: figma.code`<MediaBonsai alt={${JSON.stringify(alt)}} />`,
  imports: ['import { MediaBonsai } from "@mizu/ui"'], id: 'mizu-keynote-media-bonsai',
  metadata: { nestable: true, props: { kind: 'Bonsai', alt } },
}
