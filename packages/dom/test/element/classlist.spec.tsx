import { test } from 'tap'
import { classlist } from '../../src/element/classlist'

test('Constructs a set of classes from an element', async t => {
  t.deepEqual(
    [...classlist(<div class='foo bar baz'></div>)],
    ['foo', 'bar', 'baz']
    )
})
