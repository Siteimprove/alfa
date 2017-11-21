import { Rule, rule } from '@endal/rule'
import { Node, Element, traverse } from '@endal/dom'

import EN from './locale/en'

declare function landmarks (context: Node): Array<Element>

export const LANDMARK_REGION_ENCLOSED = rule({
  id: 'wcag:landmark-region-enclosed',
  criteria: [
    'wcag:1.3.1'
  ],
  locales: [
    EN
  ],
  requirements: [
    'dom'
  ],
  tests: [
    (test, { dom }) => {
      if (landmarks(dom).length === 0) {
        test.inapplicable(dom)
      } else {
        test.next()
      }
    },

    (test, { dom }) => {
      traverse(dom, node => {
        //
      })
    }
  ]
})
