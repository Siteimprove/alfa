import { Selector, IdSelector, ClassSelector, parse } from '@alfa/css'
import { Element } from '../types'
import { attribute } from './attribute'
import { classlist } from './classlist'

export function matches (element: Element, selector: string | Selector): boolean {
  const parsed = typeof selector === 'string' ? parse(selector) : selector

  if (parsed === null) {
    return false
  }

  switch (parsed.type) {
    case 'id-selector':
      return attribute(element, 'id') === parsed.name

    case 'class-selector':
      return classlist(element).has(parsed.name)
  }

  return false
}
