import * as V from '@endal/dom'

declare namespace JSX {
  interface Element extends V.Element {}

  interface ElementAttributesProperty {
    attributes: any
  }

  interface ElementChildrenAttribute {
    children: any
  }
}
