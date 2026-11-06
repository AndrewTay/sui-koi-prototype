// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-405
// source=packages/mizu-ui/src/forms.tsx
// component=OfferForm
import figma from 'figma'
import { text, children, props } from './helpers'

const instance = figma.selectedInstance

const title = text(instance, 'Propose an offer')
const summary = text(instance, 'Asking $2,400 · Kohaku N° 01')
const parts = summary.match(/^Asking\s+(.+?)\s+·\s+(.+?)(?:\s+(N°\s*.+))?$/)
const askingPrice = parts?.[1] || ''
const specimen = parts?.[2] || ''
const reference = parts?.[3] || ''
const fields = children(instance, 'Field').map(node => props(node))
const amount = fields.find(field => field.kind === 'Text')
const handover = fields.find(field => field.kind === 'Select')
const message = fields.find(field => field.kind === 'Textarea')
const currency = amount?.label.match(/\(([A-Z]{3})\)/)?.[1] || 'USD'
const initialValue = { amount: amount?.value || '', handover: handover?.value || '', message: message?.value || '' }
const handoverOptions = handover?.value ? [{ label: handover.value, value: handover.value }] : []
export default {
  example: figma.code`<OfferForm askingPrice={${JSON.stringify(askingPrice)}} specimen={${JSON.stringify(specimen)}} reference={${JSON.stringify(reference)}} currency={${JSON.stringify(currency)}} handoverOptions={${JSON.stringify(handoverOptions)}} initialValue={${JSON.stringify(initialValue)}} onSubmit={async (offer) => { /* Validate and save the offer in application state. */ }} />`,
  imports: ['import { OfferForm } from "@mizu/ui"'], id: 'mizu-keynote-offer-form',
  metadata: { nestable: true, props: { title, askingPrice, specimen, reference } },
}
