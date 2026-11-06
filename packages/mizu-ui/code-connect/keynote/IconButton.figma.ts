// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=13-204
// source=packages/mizu-ui/src/controls.tsx
// component=IconButton
import figma from 'figma'

const instance = figma.selectedInstance

const state = instance.getEnum('State', { Default: 'Default', Hover: 'Hover', Focus: 'Focus', Disabled: 'Disabled' })
const icon = instance.getInstanceSwap('Icon')
let iconCode
let label = 'Describe this action'
if (icon?.type === 'INSTANCE') {
  const resolved = icon.executeTemplate()
  iconCode = resolved.example
  label = String(resolved.metadata?.props?.actionLabel || label)
}
export default {
  example: figma.code`<IconButton label={${JSON.stringify(label)}} state="${state}" ${iconCode ? figma.code`icon={${iconCode}}` : ''} />`,
  imports: ['import { IconButton } from "@mizu/ui"'], id: 'mizu-keynote-icon-button',
  metadata: { nestable: true, props: { label, state } },
}
