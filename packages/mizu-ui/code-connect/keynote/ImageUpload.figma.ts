// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-347
// source=packages/mizu-ui/src/marketplace.tsx
// component=ImageUpload
import figma from 'figma'
import { text } from './helpers'

const instance = figma.selectedInstance

const state = instance.getEnum('State', { Empty: 'Empty', Selected: 'Selected', Error: 'Error', Uploading: 'Uploading' })
const label = state === 'Empty' || state === 'Error' ? text(instance, 'Specimen image') : 'Specimen image'
const fileName = state === 'Selected' ? text(instance, 'kohaku-overhead.jpg') : ''
const errorText = state === 'Error' ? text(instance, 'Use a PNG or JPG image. Try another ') : ''
export default {
  example: figma.code`<ImageUpload state="${state}" label={${JSON.stringify(label)}} fileName={${JSON.stringify(fileName)}} errorText={${JSON.stringify(errorText)}} onFileSelect={async (file) => { /* Validate and save this image in application state. */ }} />`,
  imports: ['import { ImageUpload } from "@mizu/ui"'], id: 'mizu-keynote-image-upload',
  metadata: { nestable: true, props: { state, label, fileName } },
}
