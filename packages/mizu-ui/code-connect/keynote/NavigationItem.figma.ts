// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=13-214
// source=packages/mizu-ui/src/controls.tsx
// component=NavigationItem
import figma from 'figma'
import { routeFor } from './helpers'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const count = instance.getString('Count')
const showCount = instance.getBoolean('Show count')
const state = instance.getEnum('State', { Default: 'Default', Selected: 'Selected', Focus: 'Focus' })
const href = routeFor(label, 0)
export default {
  example: figma.code`<NavigationItem label={${JSON.stringify(label)}} href={${JSON.stringify(href)}} count={${JSON.stringify(count)}} ${showCount ? 'showCount' : ''} state="${state}" />`,
  imports: ['import { NavigationItem } from "@mizu/ui"'], id: 'mizu-keynote-navigation-item',
  metadata: { nestable: true, props: { label, count, showCount: String(showCount), state, href } },
}
