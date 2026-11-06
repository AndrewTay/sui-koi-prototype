// url=https://www.figma.com/design/vzZcV01fYoCl3eGZylJHha/MIZU-SC-Keynote?node-id=16-491
// source=packages/mizu-ui/src/forms.tsx
// component=Dialog
import figma from 'figma'

const instance = figma.selectedInstance

const viewport = instance.getEnum('Viewport', { Desktop: 'Desktop', Mobile: 'Mobile' })
const body = instance.getInstanceSwap('Body')
let bodyCode
let title = 'Dialog'
if (body?.type === 'INSTANCE') {
  const resolved = body.executeTemplate()
  bodyCode = resolved.example
  title = String(resolved.metadata?.props?.title || title)
}
export default {
  example: figma.code`<Dialog open title={${JSON.stringify(title)}} viewport="${viewport}" onClose={() => { /* Set the dialog open state to false. */ }} body={${bodyCode || 'null'}} />`,
  imports: ['import { Dialog } from "@mizu/ui"'], id: 'mizu-keynote-dialog',
  metadata: { nestable: true, props: { viewport, title } },
}
