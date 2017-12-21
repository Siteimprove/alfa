import test from 'ava'
import { Element } from '../../src/types'
import { matches } from '../../src/element/matches'

test('Matches an element against a class', t => {
  const element: Element = <div class='foo'></div>

  t.true(matches(element, '.foo'))
  t.false(matches(element, '.fo'))
})
