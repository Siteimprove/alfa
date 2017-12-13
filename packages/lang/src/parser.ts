import { Token, WithLocation } from './lexer'

export interface Denotation<T extends Token, R> {
  readonly advance: (accept?: T['type']) => T | null
  readonly expression: (precedence?: number) => R
}

export interface Production<T extends Token, R> {
  readonly precedence: number

  readonly nud: Denotation<T, R>
}

export type Grammar<T extends Token, R> = { [P in T['type']]: Production<T, R> }

export function parse<T extends Token, R> (tokens: IterableIterator<T>, grammar: Grammar<T, R>): R {
  let token: T | null = tokens.next().value

  function advance (accept?: T['type']): T | null {
    if (token === null) {
      return null
    }

    if (accept && accept !== token.type) {
      throw new Error(`Got ${token.type}, expected ${accept}`)
    }

    const next = tokens.next()

    if (next.done) {
      token = null
    } else {
      token = next.value
    }

    return token
  }

  function expression (precedence = 0): R {
    const next = token

    advance()

    const production = grammar[next.type]

    let left = production.nud({ advance, expression })
  }
}
