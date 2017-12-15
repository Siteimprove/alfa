import test from 'ava'
import { Grammar, Production, parse } from '../src/parser'

type Expression =
  | { type: 'constant', value: number }
  | { type: 'operator', value: string, left: Expression, right: Expression }

type ExpressionToken =
  | { type: 'number', value: number }
  | { type: '+' }
  | { type: '-' }
  | { type: '*' }
  | { type: '/' }
  | { type: '^' }

type ExpressionProduction<T extends ExpressionToken> = Production<ExpressionToken, T, Expression>

const constant: ExpressionProduction<{ type: 'number', value: number }> = {
  token: 'number',

  null (token) {
    return { type: 'constant', value: token.value }
  }
}

const multiplication: ExpressionProduction<{ type: '*' }> = {
  token: '*',

  left (token, stream, expression, left) {
    return { type: 'operator', value: '*', left, right: expression() }
  }
}

const division: ExpressionProduction<{ type: '/' }> = {
  token: '/',

  left (token, stream, expression, left) {
    return { type: 'operator', value: '/', left, right: expression() }
  }
}

const addition: ExpressionProduction<{ type: '+' }> = {
  token: '+',

  null (token, { peek }) {
    const next = peek()

    if (next) {
      return { type: 'constant', value: next.value }
    } else {
      return null
    }
  },

  left (token, stream, expression, left) {
    return { type: 'operator', value: '+', left, right: expression() }
  }
}

const subtraction: ExpressionProduction<{ type: '-' }> = {
  token: '-',

  null (token, { peek }) {
    const next = peek()

    if (next) {
      return { type: 'constant', value: token.value * -1 }
    } else {
      return null
    }
  },

  left (token, stream, expression, left) {
    return { type: 'operator', value: '-', left, right: expression() }
  }
}

const exponentiation: ExpressionProduction<{ token: '^' }> = {
  token: '^',
  associate: 'right',

  left (token, stream, expression, left) {
    return { type: 'operator', value: '^', left, right: expression() }
  }
}

const ExpressionGrammar: Grammar<ExpressionToken, Expression> = [
  constant,
  exponentiation,
  [multiplication, division],
  [addition, subtraction]
]

test('operator precedence', t => {
  const tokens = [
    { type: 'number', value: 1 },
    { type: '*' },
    { type: 'number', value: 2 },
    { type: '+' },
    { type: 'number', value: 3 }
  ]

  t.snapshot(parse(tokens, ExpressionGrammar))
})
