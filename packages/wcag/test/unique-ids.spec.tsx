import test from 'ava'

import { check } from '@alfa/rule'
import { Element } from '@alfa/dom'

import { UNIQUE_IDS } from '../src/unique-ids/rule'

test('passes when no duplicate ids exist within a context', async t => {
  const dom: Element = (
    <div id='foo'>
      <span id='bar'></span>
    </div>
  )

  const results = await check(UNIQUE_IDS, { document: foo })
})

test('fails when elements with duplicate ids exist within a context', async t => {
  const dom: Element = (
    <div id='foo'>
      <span id='foo'></span>
    </div>
  )

  const results = await check(UNIQUE_IDS, { document: foo })
})
