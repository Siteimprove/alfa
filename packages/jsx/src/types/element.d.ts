declare namespace JSX {
  interface Text {
    type: 'text'
    value: string
    parent: Element | null
  }

  interface Element {
    type: 'element'
    tag: string
    namespace: string | null
    attributes: { [name: string]: string | number | boolean }
    children: Array<Element | Text>
    parent: Element | null
  }

  interface ElementAttributesProperty {
    attributes: any
  }

  interface ElementChildrenAttribute {
    children: any
  }
}
