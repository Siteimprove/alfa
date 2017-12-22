import { TestContext } from 'ava'
import { Outcome, Result, Target, Requirement } from '@alfa/rule'
import { render } from '@alfa/dom'

export function outcome<T extends Target, R extends Requirement> (t: TestContext, results: Array<Result<T, R>>, assert: { [O in Outcome]?: Array<T | null> }) {
  const outcomes: Array<Outcome> = ['passed', 'failed', 'inapplicable']

  for (const outcome of outcomes) {
    const actual = results.filter(result => result.outcome === outcome)
    const expected = assert[outcome] || []

    t.is(actual.length, expected.length, `There must be ${expected.length} ${outcome} results`)

    for (const { target } of actual) {
      t.true(expected.some(element => element === target), `${render(target)} must be ${outcome}`)
    }
  }
}
