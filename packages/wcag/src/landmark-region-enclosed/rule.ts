import { rule } from '@alfa/rule'
import { Node, traverse } from '@alfa/dom'

import EN from './locale/en'

declare function landmarks (context: Node): Array<Element>

export const LANDMARK_REGION_ENCLOSED = rule({
  id: 'alfa:wcag:landmark-region-enclosed',
  criteria: [
    'wcag:1.3.1'
  ],
  locales: [
    EN
  ],
  requirements: [
    'document'
  ],
  tests: [
    (test, { document }) => {
      if (landmarks(document).length === 0) {
        test.inapplicable(document)
      } else {
        test.next()
      }
    },

    (test, { document }) => {
      traverse(document, node => {
        //
      })
    }
  ]
})
