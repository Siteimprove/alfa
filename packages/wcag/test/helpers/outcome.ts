import { Test } from '@alfa/test'
import { Outcome, Result, Target, Aspect } from '@alfa/rule'
import { render } from '@alfa/dom'

export function outcome<T extends Target, A extends Aspect> (t: Test, results: Array<Result<T, A>>, assert: { [O in Outcome]?: Array<T | null> }) {
  const outcomes: Array<Outcome> = ['passed', 'failed', 'inapplicable']

  for (const outcome of outcomes) {
    const actual = results.filter(result => result.outcome === outcome)
    const expected = assert[outcome] || []

    t.is(actual.length, expected.length, `There must be ${expected.length} ${outcome} results`)

    for (const target of expected) {
      if (target === null) {
      } else {
        const holds = actual.some(result => result.outcome === 'inapplicable' || result.target === target)

        t.true(holds, `${render(target)} must be ${outcome}`)
      }
    }
  }
}
