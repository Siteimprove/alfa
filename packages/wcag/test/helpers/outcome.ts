import { TestContext } from 'ava'
import { Outcome, Result, Target, Requirement } from '@alfa/rule'

export function outcome<T extends Target, R extends Requirement> (t: TestContext, results: Array<Result<T, R>>, assert: { [O in Outcome]?: Array<T> }) {
  const outcomes: Array<Outcome> = ['passed', 'failed', 'inapplicable']

  for (const outcome of outcomes) {
    const actual = results.filter(result => result.outcome === outcome)
    const expected = assert[outcome] || []

    t.is(actual.length, expected.length, `Have have same number of ${outcome} results`)
  }
}
