import test from 'ava'
import { matches } from '../../src/element/matches'

test('Matches an element against a class', t => {
  t.true(matches(<div class='foo'></div>, '.foo'))
})

test('Matches an element against an ID', t => {
  t.true(matches(<div id='foo'></div>, '#foo'))
})
