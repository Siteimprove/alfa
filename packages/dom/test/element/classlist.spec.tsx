import test from 'ava'
import { classlist } from '../../src/element/classlist'

test('Constructs a set of classes from an element', t => {
  t.deepEqual(
    [...classlist(<div class='foo bar baz'></div>)],
    ['foo', 'bar', 'baz']
    )
})
