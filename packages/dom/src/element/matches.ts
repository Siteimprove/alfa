import { Selector, SelectorList, parse } from '@alfa/css'
import { memoize } from '@alfa/util'
import { Element } from '../types'
import { isElement } from '../guards'
import { attribute } from './attribute'
import { classlist } from './classlist'

const parseMemoized = memoize(parse, { cache: { size: 50 } })

export function matches (element: Element, selector: string | Selector | SelectorList): boolean {
  const parsed = typeof selector === 'string' ? parseMemoized(selector) : selector

  if (parsed === null) {
    return false
  }

  switch (parsed.type) {
    case 'type-selector':
      return element.tag === parsed.name

    case 'class-selector':
      return classlist(element).has(parsed.name)

    case 'id-selector':
      return attribute(element, 'id') === parsed.name

    case 'compound-selector':
      return parsed.selectors.every(selector => matches(element, selector))

    case 'selector-list':
      return parsed.selectors.some(selector => matches(element, selector))

    case 'relative-selector':
      if (!matches(element, parsed.selector)) {
        return false
      }

      switch (parsed.combinator) {
        case '>>':
          let { parent } = element

          while (parent && isElement(parent)) {
            if (matches(parent, parsed.relative)) {
              return true
            }

            parent = parent.parent
          }

          return false
      }
  }
}
