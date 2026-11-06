// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=13-187
// source=packages/mizu-ui/src/controls.tsx
// component=Button
import figma from 'figma'
import { text } from './helpers'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const appearance = instance.getEnum('Appearance', { Primary: 'Primary', Secondary: 'Secondary', Text: 'Text' })
const state = instance.getEnum('State', { Default: 'Default', Hover: 'Hover', Pressed: 'Pressed', Focus: 'Focus', Disabled: 'Disabled', Loading: 'Loading' })
const showIcon = instance.getBoolean('Show icon')
const icon = instance.getInstanceSwap('Icon')
let iconCode
if (showIcon && icon?.type === 'INSTANCE') iconCode = icon.executeTemplate().example
const loadingLabel = state === 'Loading' ? text(instance, 'Sending…') : 'Sending…'
export default {
  example: figma.code`<Button appearance="${appearance}" state="${state}" label={${JSON.stringify(label)}} loadingLabel={${JSON.stringify(loadingLabel)}} ${showIcon ? 'showIcon' : ''} ${iconCode ? figma.code`icon={${iconCode}}` : ''} />`,
  imports: ['import { Button } from "@mizu/ui"'], id: 'mizu-keynote-button',
  metadata: { nestable: true, props: { label, appearance, state, showIcon: String(showIcon) } },
}
