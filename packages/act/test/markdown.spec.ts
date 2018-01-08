import { test } from 'tap'

import { UNIQUE_IDS } from '@alfa/wcag'

import { markdown } from '../src/markdown'

test('returns an act compliant markdown version of a rule', async t => {
  const md = markdown(UNIQUE_IDS, 'en')

  t.true(md !== '')
})
