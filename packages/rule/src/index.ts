import { Node } from '@endal/dom'
import { Style, State } from '@endal/css'

export type Outcome = 'passed' | 'failed' | 'inapplicable'

export interface Context {
  readonly dom: Node,
  readonly css: Map<Element, { [S in State]: Style }>
}

export type Target = Node

export interface Result<R extends Requirement> {
  readonly test: string
  readonly context: Pick<Context, R>
  readonly target: Target
  readonly outcome: Outcome
}

export interface Assertions<T extends Target> {
  passed (target: T): void
  failed (target: T): void
  inapplicable (target: T): void
  next (data?: any): void
}

export type Criterion = string

export type Requirement = keyof Context

export interface Locale {
  readonly id: 'en'
  readonly title: string
  readonly description: string
  readonly tests: Array<{
    readonly description: string
    readonly outcome: {
      readonly [P in Outcome]?: string
    }
  }>
}

export type Test<T extends Target, R extends Requirement> = (test: Assertions<T>, context: Pick<Context, R>, data?: any) => Promise<any> | any

export interface Rule<T extends Target, R extends Requirement> {
  readonly id: string
  readonly criteria: Array<Criterion>
  readonly locales: Array<Locale>
  readonly requirements: Array<R>
  readonly tests: Array<Test<T, R>>
}

export function rule<T extends Target, R extends Requirement> (definition: Rule<T, R>): Rule<T, R> {
  return definition
}

export async function check<T extends Target, R extends Requirement> (rule: Rule<T, R>, context: Pick<Context, R>): Promise<Array<Result<R>>> {
  const results: Array<Result<R>> = []

  const result = (target: Target, outcome: Outcome) => {
    results.push({ test: rule.id, target, context, outcome })
  }

  const tests = [...rule.tests]

  const run = async (test: Test<T, R> | undefined, index: number, data?: any): Promise<Array<Result<R>>> => {
    if (test === undefined) {
      return results
    }

    let next: any

    const assertions: Assertions<T> = {
      passed (target: T) {
        result(target, 'passed')
      },

      failed (target: T) {
        result(target, 'failed')
      },

      inapplicable (target: T) {
        result(target, 'inapplicable')
      },

      next (data) {
        next = data === undefined ? true : data
      }
    }

    await test(assertions, context, data)

    return next ? run(tests.shift(), index + 1, next) : results
  }

  return run(tests.shift(), 0)
}
