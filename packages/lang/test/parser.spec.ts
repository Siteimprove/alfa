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

function isNumber (token: ExpressionToken): token is ({ type: 'number', value: number }) {
  return token.type === 'number' && 'value' in token
}

const constant: ExpressionProduction<{ type: 'number', value: number }> = {
  token: 'number',

  prefix (token) {
    return { type: 'constant', value: token.value }
  }
}

const multiplication: ExpressionProduction<{ type: '*' }> = {
  token: '*',

  infix (token, stream, expression, left) {
    const right = expression()

    if (right === null) {
      throw new Error('Expected right-hand-side expression')
    }

    return { type: 'operator', value: '*', left, right }
  }
}

const division: ExpressionProduction<{ type: '/' }> = {
  token: '/',

  infix (token, stream, expression, left) {
    const right = expression()

    if (right === null) {
      throw new Error('Expected right-hand-side expression')
    }

    return { type: 'operator', value: '/', left, right }
  }
}

const addition: ExpressionProduction<{ type: '+' }> = {
  token: '+',

  prefix (token, { peek, accept }) {
    const num = accept(isNumber)

    if (num === false) {
      throw new Error('Expected number')
    }

    return { type: 'constant', value: num.value }
  },

  infix (token, stream, expression, left) {
    const right = expression()

    if (right === null) {
      throw new Error('Expected right-hand-side expression')
    }

    return { type: 'operator', value: '+', left, right }
  }
}

const subtraction: ExpressionProduction<{ type: '-' }> = {
  token: '-',

  prefix (token, { peek, accept }) {
    const num = accept(isNumber)

    if (num === false) {
      throw new Error('Expected number')
    }

    return { type: 'constant', value: num.value * -1 }
  },

  infix (token, stream, expression, left) {
    const right = expression()

    if (right === null) {
      throw new Error('Expected right-hand-side expression')
    }

    return { type: 'operator', value: '-', left, right }
  }
}

const exponentiation: ExpressionProduction<{ type: '^' }> = {
  token: '^',
  associate: 'right',

  infix (token, stream, expression, left) {
    const right = expression()

    if (right === null) {
      throw new Error('Expected right-hand-side expression')
    }

    return { type: 'operator', value: '^', left, right }
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
