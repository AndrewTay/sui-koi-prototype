// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-538
// source=packages/mizu-ui/src/marketplace.tsx
// component=Header
import figma from 'figma'
import { children, props, routeFor } from './helpers'

const instance = figma.selectedInstance

const viewport = instance.getEnum('Viewport', { Desktop: 'Desktop', Mobile: 'Mobile' })
const routes = children(instance, 'Navigation item').map((node, index) => {
  const item = props(node)
  return { label: item.label, href: routeFor(item.label, index), ...(item.showCount === 'true' ? { count: item.count } : {}), selected: item.state === 'Selected' }
})
const currentHref = routes.find(route => route.selected)?.href || ''
const routeData = routes.map(({ selected, ...route }) => route)
export default {
  example: figma.code`<Header viewport="${viewport}" brandHref="#pond" routes={${JSON.stringify(routeData)}} currentHref={${JSON.stringify(currentHref)}} onMenuClick={() => { /* Open the department drawer. */ }} />`,
  imports: ['import { Header } from "@mizu/ui"'], id: 'mizu-keynote-header',
  metadata: { nestable: true, props: { viewport, currentHref } },
}
