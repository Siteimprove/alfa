import { Bound } from '@alfa/util'
import { Token, WithLocation } from './lexer'

const { isArray } = Array

type Predicate<T, U extends T> = ((n: T) => boolean) | ((n: T) => n is U)

class Stream<T extends Token> extends Bound {
  private readonly _input: Array<T>

  private _position: number = 0

  public get position () {
    return this._position
  }

  public constructor (input: Array<T>) {
    super()
    this._input = input
  }

  public restore (position: number): void {
    this._position = position
  }

  public peek (): T {
    return this._input[this._position]
  }

  public advance (): boolean {
    let advanced = false

    if (this._position < this._input.length) {
      advanced = true
      this._position++
    }

    return advanced
  }

  public next (): T {
    const next = this.peek()
    this.advance()
    return next
  }

  public accept<U extends T> (predicate: Predicate<T, U>): U | false {
    const token = this.peek()

    if (predicate(token)) {
      this.advance()
      return token as U
    }

    return false
  }
}

export interface Production<T extends Token, U extends T, R> {
  readonly token: U['type']
  readonly associate?: 'left' | 'right'
  readonly null?: (token: U, stream: Stream<T>, expression: () => R) => R | void
  readonly left?: (token: U, stream: Stream<T>, expression: () => R, left: R) => R | void
}

export type Grammar<T extends Token, R> = Array<Production<T, T, R> | Array<Production<T, T, R>>>

export function parse<T extends Token, R> (input: Array<T>, grammar: Grammar<T, R>): R {
  const productions: Map<T['type'], Production<T, T, R> & { precedence: number }> = new Map()
  const stream = new Stream(input)

  for (let i = 0; i < grammar.length; i++) {
    const precedence = grammar.length - i
    const group = grammar[i]

    for (const production of isArray(group) ? group : [group]) {
      productions.set(production.token, { ...production, precedence })
    }
  }

  function expression (precedence: number): R {
    let token = stream.peek()
    let production = productions.get(token.type)

    if (production === undefined || production.null === undefined) {
      throw new Error(`Unexpected token '${token}'`)
    }

    stream.advance()

    let left = production.null(token, stream, expression.bind(null, -1))

    if (left === undefined) {
      throw new Error(`Unexpected token '${token}'`)
    }

    while (stream.peek()) {
      token = stream.peek()
      production = productions.get(token.type)

      if (production === undefined || production.left === undefined) {
        throw new Error(`Unexpected token '${token}'`)
      }

      if (precedence > production.precedence || (precedence === production.precedence && production.associate !== 'right')) {
        break
      }

      stream.advance()

      left = production.left(token, stream, expression.bind(null, production.precedence), left)

      if (left === undefined) {
        throw new Error(`Unexpected token '${token}'`)
      }
    }

    return left
  }

  return expression(-1)
}
