// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-244
// source=packages/mizu-ui/src/marketplace.tsx
// component=Message
import figma from 'figma'

const instance = figma.selectedInstance

const message = instance.getString('Message')
const timestamp = instance.getString('Timestamp')
const direction = instance.getEnum('Direction', { Received: 'Received', Sent: 'Sent' })
export default {
  example: figma.code`<Message message={${JSON.stringify(message)}} timestamp={${JSON.stringify(timestamp)}} direction="${direction}" />`,
  imports: ['import { Message } from "@mizu/ui"'], id: 'mizu-keynote-message',
  metadata: { nestable: true, props: { message, timestamp, direction } },
}
