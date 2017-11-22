import * as V from '@endal/dom'

export function jsx (tag: string, attributes: { [name: string]: string | number | boolean } | null, ...children: Array<V.Element | string>): V.Element {
  const element: V.Element = {
    type: 'element',
    tag,
    namespace: null,
    attributes: attributes === null ? {} : attributes,
    children: [],
    parent: null
  }

  for (const node of children) {
    let child: V.Element | V.Text | null = null

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

declare global {
  namespace JSX {
    interface Element extends V.Element {}

    interface ElementAttributesProperty {
      attributes: any
    }

    interface IntrinsicElements {
      [tag: string]: any
    }
  }
}
