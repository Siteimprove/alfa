import { Node, Element, Text } from '@endal/dom'

export function jsx (tag: string, attributes: { [name: string]: string | number | boolean } | null, ...children: Array<Element | string>): Element {
  const element: Element = {
    type: 'element',
    tag,
    namespace: null,
    attributes: attributes === null ? {} : attributes,
    children: [],
    parent: null
  }

  for (const node of children) {
    let child: Element | Text | null = null

    if (typeof node === 'string') {
      child = {
        type: 'text',
        value: node,
        parent: element
      }
    } else {
      child = { ...node, parent: element }
    }

    element.children.push(child)
  }

  return element
}
