import test from 'ava'
import { Element } from '../../src/types'
import { classlist } from '../../src/element/classlist'

test('Constructs a set of classes from an element', t => {
  const element: Element = <div class='foo bar baz'></div>

  t.deepEqual([...classlist(element)], ['foo', 'bar', 'baz'])
})
