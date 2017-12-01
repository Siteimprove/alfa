import { rule } from '@alfa/rule'
import { Element, Attribute, attribute, isElement, collect } from '@alfa/dom'

import EN from './locale/en'

type Ids = Map<Attribute, Set<Element>>

export const UNIQUE_IDS = rule({
  id: 'wcag:unique-ids',
  criteria: [
    'wcag:4.1.1'
  ],
  locales: [
    EN
  ],
  requirements: [
    'document'
  ],
  tests: [
    (test, { document }) => {
      const ids: Ids = new Map()

      for (const element of collect(document).where(isElement)) {
        const id = attribute(element, 'id', { trim: true })

        if (id) {
          const elements = ids.get(id)

          if (elements) {
            elements.add(element)
          } else {
            ids.set(id, new Set([element]))
          }
        }
      }

      if (ids.size === 0) {
        test.inapplicable(document)
      } else {
        test.next(ids)
      }
    },

    (test, context, data) => {
      const ids = data as Ids

      for (const elements of ids.values()) {
        if (elements.size === 1) {
          const [element] = elements
          test.passed(element)
        } else {
          for (const element of elements) {
            test.failed(element)
          }
        }
      }
    }
  ]
})
