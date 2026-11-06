// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-300
// source=packages/mizu-ui/src/marketplace.tsx
// component=DepartmentAccordion
import figma from 'figma'
import { children, props, routeFor } from './helpers'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const expanded = instance.getEnum('Expanded', { False: false, True: true })
const items = children(instance, 'Navigation item').map((node, index) => {
  const item = props(node)
  return { label: item.label, href: routeFor(item.label, index) }
})
export default {
  example: figma.code`<DepartmentAccordion label={${JSON.stringify(label)}} defaultExpanded={${String(expanded)}} items={${JSON.stringify(items)}} />`,
  imports: ['import { DepartmentAccordion } from "@mizu/ui"'], id: 'mizu-keynote-department-accordion',
  metadata: { nestable: true, props: { label, expanded: String(expanded) } },
}
