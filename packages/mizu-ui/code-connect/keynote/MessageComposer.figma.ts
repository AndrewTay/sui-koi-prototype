// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-404
// source=packages/mizu-ui/src/forms.tsx
// component=MessageComposer
import figma from 'figma'
import { props } from './helpers'

const instance = figma.selectedInstance

const state = instance.getEnum('State', { Default: 'Default', Sending: 'Sending', Error: 'Error' })
const field = instance.findInstance('Field', { traverseInstances: true })
const initialDraft = field.type === 'INSTANCE' ? props(field).value : ''
export default {
  example: figma.code`<MessageComposer state="${state}" initialDraft={${JSON.stringify(initialDraft)}} onSend={async (message) => { /* Append this message to the conversation. */ }} />`,
  imports: ['import { MessageComposer } from "@mizu/ui"'], id: 'mizu-keynote-message-composer',
  metadata: { nestable: true, props: { state, initialDraft } },
}
