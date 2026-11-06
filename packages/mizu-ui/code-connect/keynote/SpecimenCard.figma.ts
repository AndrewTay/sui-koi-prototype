// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-234
// source=packages/mizu-ui/src/marketplace.tsx
// component=SpecimenCard
import figma from 'figma'

const instance = figma.selectedInstance

const title = instance.getString('Title')
const metadata = instance.getString('Metadata')
const reference = instance.getString('Reference')
const showReference = instance.getBoolean('Show reference')
const layout = instance.getEnum('Layout', { Gallery: 'Gallery', Compact: 'Compact' })
const state = instance.getEnum('State', { Default: 'Default', Hover: 'Hover', Focus: 'Focus' })
const media = instance.getInstanceSwap('Media')
let mediaCode
if (media?.type === 'INSTANCE') mediaCode = media.executeTemplate().example
export default {
  example: figma.code`<SpecimenCard title={${JSON.stringify(title)}} metadata={${JSON.stringify(metadata)}} reference={${JSON.stringify(reference)}} ${showReference ? 'showReference' : ''} layout="${layout}" state="${state}" ${mediaCode ? figma.code`media={${mediaCode}}` : ''} />`,
  imports: ['import { SpecimenCard } from "@mizu/ui"'], id: 'mizu-keynote-specimen-card',
  metadata: { nestable: true, props: { title, metadata, reference, layout, state } },
}
