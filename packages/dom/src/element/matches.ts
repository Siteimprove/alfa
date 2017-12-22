import { Selector, SelectorList, parse } from '@alfa/css'
import { memoize } from '@alfa/util'
import { Element } from '../types'
import { attribute } from './attribute'
import { classlist } from './classlist'

const parseMemoized = memoize(parse, { cache: { size: 50 } })

export function matches (element: Element, selector: string | Selector | SelectorList): boolean {
  const parsed = typeof selector === 'string' ? parseMemoized(selector) : selector

  if (parsed === null) {
    return false
  }

  switch (parsed.type) {
    case 'id-selector':
      return attribute(element, 'id') === parsed.name

    case 'class-selector':
      return classlist(element).has(parsed.name)

    case 'compound-selector':
      return parsed.selectors.every(selector => matches(element, selector))

    case 'selector-list':
      return parsed.selectors.some(selector => matches(element, selector))
  }
}
