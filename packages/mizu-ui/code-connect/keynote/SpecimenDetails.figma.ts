// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-539
// source=packages/mizu-ui/src/marketplace.tsx
// component=SpecimenDetails
import figma from 'figma'
import { text, children, props } from './helpers'

const instance = figma.selectedInstance

const title = text(instance, 'Kohaku')
const price = text(instance, '$2,400')
const seller = text(instance, 'Mizuho Koi House · Sonoma, CA')
const description = text(instance, 'Red and white patterning, viewed fro')
const facts = children(instance, 'Fact row').map(node => {
  const fact = props(node)
  return { label: fact.label, value: fact.value }
})
const saveButton = children(instance, 'Button').find(node => node.getString('Appearance') === 'Secondary')
const saved = saveButton ? /^Saved/.test(props(saveButton).label) : false
export default {
  example: figma.code`<SpecimenDetails title={${JSON.stringify(title)}} price={${JSON.stringify(price)}} seller={${JSON.stringify(seller)}} description={${JSON.stringify(description)}} facts={${JSON.stringify(facts)}} saved={${String(saved)}} onSave={() => { /* Toggle this specimen in saved state. */ }} onMakeOffer={() => { /* Open the offer dialog. */ }} />`,
  imports: ['import { SpecimenDetails } from "@mizu/ui"'], id: 'mizu-keynote-specimen-details',
  metadata: { nestable: true, props: { title, price, seller, description } },
}
