import { Selector, IdSelector, ClassSelector, parse } from '@alfa/css'
import { Element } from './types'

export function matches (element: Element, selector: string | Selector): boolean {
  const parsed = typeof selector === 'string' ? parse(selector) : selector

  if (parsed === null) {
    return false
  }

  const { attributes } = element

  switch (parsed.type) {
    case 'id-selector':
      if (attributes.id === undefined) {
        return false
      }

      return attributes.id === parsed.name

    case 'class-selector':
      if (attributes.class === undefined) {
        return false
      }

      return attributes.class
        .split(/\s+/)
        .indexOf(parsed.name) !== -1
  }

  return false
}
