import test from 'ava'

import { check } from '@endal/rule'
import { Element } from '@endal/dom'

import { UNIQUE_IDS } from '../../src/unique-ids/rule'

test('passes when no duplicate ids exist within a context', async t => {
  const dom: Element = (
    <div id='foo'>
      <span id='bar'></span>
    </div>
  )

  const result = await check(UNIQUE_IDS, { dom })
})

test('fails when elements with duplicate ids exist within a context', async t => {
  const dom: Element = (
    <div id='foo'>
      <span id='foo'></span>
    </div>
  )

  const result = await check(UNIQUE_IDS, { dom })
})
