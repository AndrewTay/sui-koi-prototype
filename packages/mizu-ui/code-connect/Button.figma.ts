// url=https://www.figma.com/design/BudoJIcMQdoMoZqgKr1lzD/mizu---Collector-s-Marketplace?node-id=13-187
// source=packages/mizu-ui/src/controls.tsx
// component=Button
import figma from 'figma'

const instance = figma.selectedInstance
const label = instance.getString('Label')
const appearance = instance.getEnum('Appearance', {
  Primary: 'Primary',
  Secondary: 'Secondary',
  Text: 'Text',
})
const state = instance.getEnum('State', {
  Default: 'Default',
  Hover: 'Hover',
  Pressed: 'Pressed',
  Focus: 'Focus',
  Disabled: 'Disabled',
  Loading: 'Loading',
})
const showIcon = instance.getBoolean('Show icon')
const icon = showIcon ? instance.getInstanceSwap('Icon') : null
let iconCode
if (icon && icon.type === 'INSTANCE') iconCode = icon.executeTemplate().example

export default {
  example: figma.code`<Button appearance="${appearance}" state="${state}" label="${label}" ${showIcon ? 'showIcon' : ''} ${iconCode ? figma.code`icon={${iconCode}}` : ''} />`,
  imports: ['import { Button } from "@mizu/ui"'],
  id: 'mizu-button',
  metadata: { nestable: true },
}
