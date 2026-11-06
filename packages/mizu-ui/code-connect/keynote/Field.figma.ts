// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=13-345
// source=packages/mizu-ui/src/controls.tsx
// component=Field
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const value = instance.getString('Value')
const helpText = instance.getString('Help text')
const showHelp = instance.getBoolean('Show help')
const kind = instance.getEnum('Kind', { Text: 'Text', Select: 'Select', Textarea: 'Textarea' })
const state = instance.getEnum('State', { Default: 'Default', Filled: 'Filled', Focus: 'Focus', Error: 'Error', Disabled: 'Disabled' })
const isPlaceholder = kind === 'Text' && state === 'Default'
const options = kind === 'Select' ? [{ value, label: value }] : []
export default {
  example: figma.code`<Field label={${JSON.stringify(label)}} kind="${kind}" state="${state}" ${isPlaceholder ? figma.code`placeholder={${JSON.stringify(value)}}` : figma.code`defaultValue={${JSON.stringify(value)}}`} helpText={${JSON.stringify(helpText)}} ${showHelp ? 'showHelp' : ''} ${state === 'Error' ? figma.code`errorText={${JSON.stringify(helpText)}}` : ''} ${kind === 'Select' ? figma.code`options={${JSON.stringify(options)}}` : ''} />`,
  imports: ['import { Field } from "@mizu/ui"'], id: 'mizu-keynote-field',
  metadata: { nestable: true, props: { label, value, helpText, showHelp: String(showHelp), kind, state } },
}
