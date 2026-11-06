// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=13-245
// source=packages/mizu-ui/src/controls.tsx
// component=FilterTab
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const count = instance.getString('Count')
const showCount = instance.getBoolean('Show count')
const selected = instance.getEnum('Selected', { False: false, True: true })
const state = instance.getEnum('State', { Default: 'Default', Hover: 'Hover', Focus: 'Focus' })
export default {
  example: figma.code`<FilterTab label={${JSON.stringify(label)}} count={${JSON.stringify(count)}} ${showCount ? 'showCount' : ''} ${selected ? 'selected' : ''} state="${state}" />`,
  imports: ['import { FilterTab } from "@mizu/ui"'], id: 'mizu-keynote-filter-tab',
  metadata: { nestable: true, props: { label, count, showCount: String(showCount), selected: String(selected), state } },
}
