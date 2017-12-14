import { Token, WithLocation } from './lexer'

export type Context<T extends Token, U extends T, R> = {
  readonly advance: () => T | null
  readonly expression: (precedence?: number) => R | null
}

export interface Production<T extends Token, U extends T, R> {
  readonly token: U['type']
  readonly null?: (token: U, context: Context<T, U, R>) => R | null
  readonly left?: (token: U, context: Context<T, U, R>, left: R | null) => R | null
}

export type Grammar<T extends Token, R> = Array<Production<T, T, R>>

export function parse<T extends Token, R> (tokens: Iterator<T>, grammar: Grammar<T, R>): R | null {
  let token: T | null = null

  function advance<U extends T> (): T | null {
    const next = tokens.next()

    if (next.done) {
      token = null
    } else {
      token = next.value
    }

    return token
  }

  function expression (): R | null {
    token = advance()

    if (token === null) {
      return null
    }

    const { type } = token

    let production = grammar.find(({ token: found }) => found === type)

    if (production === undefined || production.null === undefined) {
      throw new Error()
    }

    let left = production.null(token, { advance, expression })

    do {
      token = advance()

      if (token === null) {
        break
      }

      const { type } = token

      let production = grammar.find(({ token: found }) => found === type)

      if (production === undefined || production.left === undefined) {
        throw new Error()
      }

      left = production.left(token, { advance, expression }, left)
    } while (token)

    return left
  }

  return expression()
}
