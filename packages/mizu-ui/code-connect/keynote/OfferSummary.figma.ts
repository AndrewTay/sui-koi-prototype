// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-278
// source=packages/mizu-ui/src/marketplace.tsx
// component=OfferSummary
import figma from 'figma'
import { props } from './helpers'

const instance = figma.selectedInstance

const title = instance.getString('Title')
const seller = instance.getString('Seller')
const status = instance.getEnum('Status', { Counter: 'Counter', Reserved: 'Reserved', Pending: 'Pending' })
const badge = instance.findInstance('Status badge')
const badgeProps = badge.type === 'INSTANCE' ? props(badge) : {}
const amount = badgeProps.showAmount === 'true' ? badgeProps.amount : ''
const media = instance.getInstanceSwap('Media')
let mediaCode
if (media?.type === 'INSTANCE') mediaCode = media.executeTemplate().example
export default {
  example: figma.code`<OfferSummary title={${JSON.stringify(title)}} seller={${JSON.stringify(seller)}} status="${status}" amount={${JSON.stringify(amount)}} ${mediaCode ? figma.code`media={${mediaCode}}` : ''} />`,
  imports: ['import { OfferSummary } from "@mizu/ui"'], id: 'mizu-keynote-offer-summary',
  metadata: { nestable: true, props: { title, seller, status, amount } },
}
