import type { InstanceHandle } from 'figma'

/** Read actual layer content; a missing layer is not replaced with sample copy. */
export function text(instance: InstanceHandle, name: string): string {
  const node = instance.findText(name)
  return node.type === 'TEXT' ? node.textContent : ''
}

/** Resolve configurable children without depending on publication order. */
export function children(instance: InstanceHandle, name: string): InstanceHandle[] {
  return instance.findLayers(node => node.type === 'INSTANCE' && node.name === name)
    .filter((node): node is InstanceHandle => node.type === 'INSTANCE')
}

export function props(instance: InstanceHandle): Record<string, string> {
  return (instance.executeTemplate().metadata?.props ?? {}) as Record<string, string>
}

/** These routes are the routes used by marketplace/main.tsx. Custom labels need an app route. */
export function routeFor(label: string, index: number): string {
  const routes: Record<string, string> = { Collection: '#collection', Offers: '#offers', Sell: '#sell', Saved: '#saved' }
  return routes[label] || `#replace-route-${index + 1}`
}
