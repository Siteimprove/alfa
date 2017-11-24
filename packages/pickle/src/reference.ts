import * as V from '@endal/dom'

export type WithReference<T extends V.Node> = { [P in keyof T]: T[P] } & { ref: Node }

export function hasReference<T extends V.Node> (node: T): node is WithReference<T> {
  return 'ref' in node
}
