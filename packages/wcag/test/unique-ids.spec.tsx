import test from 'ava'

import { check } from '@alfa/rule'
import { Element } from '@alfa/dom'

import { UNIQUE_IDS } from '../src/unique-ids/rule'
import { outcome } from './helpers/outcome'

test('Passes when no duplicate IDs exist within a document', async t => {
  const bar: Element = <span id='bar'></span>
  const foo: Element = <span id='foo'>{bar}</span>

  const results = await check(UNIQUE_IDS, { document: foo })

  outcome(t, results, { passed: [foo, bar] })
})

test('Fails when elements with duplicate IDs exist within a document', async t => {
  const bar: Element = <span id='foo'></span>
  const foo: Element = <span id='foo'>{bar}</span>

  const results = await check(UNIQUE_IDS, { document: foo })

  outcome(t, results, { failed: [foo, bar] })
})
