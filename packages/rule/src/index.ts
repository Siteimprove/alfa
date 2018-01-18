import { Node, Element } from '@alfa/dom'
import { Style, State } from '@alfa/css'
import { Layout } from '@alfa/layout'

export type Criterion = string

export type Target = Node

export interface Aspects {
  readonly document: Node,
  readonly style: Map<Element, { [S in State]: Style }>
  readonly layout: Map<Element, Layout>
}

export type Aspect = keyof Aspects

export type Result<T extends Target, A extends Aspect> =
  {
    readonly rule: string
    readonly context: Pick<Aspects, A>
  } & (
    {
      readonly outcome: 'passed' | 'failed'
      readonly target: T
    } |
    {
      readonly outcome: 'inapplicable'
    }
  )

export type Outcome = Result<Target, Aspect>['outcome']

export interface Locale {
  readonly id: 'en'
  readonly title: string
  readonly description: string
  readonly assumptions?: string
  readonly applicability: string
  readonly expectations: Array<{
    readonly description: string
    readonly outcome: {
      readonly [P in Outcome]: string
    }
  }>
}

export type Applicability<T extends Target, A extends Aspect> = (context: Pick<Aspects, A>) => Promise<Iterable<T>>

export type Expectation<T extends Target, A extends Aspect> = (target: T, context: Pick<Aspects, A>) => Promise<boolean>

export interface Rule<T extends Target, A extends Aspect> {
  readonly id: string
  readonly criteria: Array<Criterion>
  readonly locales: Array<Locale>
  readonly applicability: Applicability<T, A>
  readonly expectations: Array<Expectation<T, A>>
}

export async function check<T extends Target, A extends Aspect> (rule: Rule<T, A>, context: Pick<Aspects, A>): Promise<Array<Result<T, A>>> {
  const results: Array<Result<T, A>> = []

  const targets = [...await rule.applicability(context)]

  if (targets.length === 0) {
    results.push({
      rule: rule.id,
      outcome: 'inapplicable',
      context
    })
  } else {
    for (const target of targets) {
      let passed = true

      for (const expectation of rule.expectations) {
        const holds = await expectation(target, context)

        if (!holds) {
          passed = false
        }
      }

      results.push({
        rule: rule.id,
        outcome: passed ? 'passed' : 'failed',
        context,
        target
      })
    }
  }

  return results
}

export async function checkAll<T extends Target, A extends Aspect> (rules: Array<Rule<T, A>>, context: Pick<Aspects, A>): Promise<Array<Result<T, A>>> {
  const results: Array<Result<T, A>> = []

  for (const rule of rules) {
    for (const result of await check(rule, context)) {
      results.push(result)
    }
  }

  return results
}
