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

type ExpressionProduction<T extends ExpressionToken> = Production<ExpressionToken, T, Expression>

const constant: ExpressionProduction<{ type: 'number', value: number }> = {
  token: 'number',

  null (token) {
    return { type: 'constant', value: token.value }
  }
}

const multiplication: ExpressionProduction<{ type: '*' }> = {
  token: '*',

  left (token, { expression }, left) {
    return { type: 'operator', value: '*', left, right: expression() }
  }
}

const division: ExpressionProduction<{ type: '/' }> = {
  token: '/',

  left (token, { expression }, left) {
    return { type: 'operator', value: '/', left, right: expression() }
  }
}

const addition: ExpressionProduction<{ type: '+' }> = {
  token: '+',

  null (_, { advance }) {
    const token = advance()

    if (token) {
      return { type: 'constant', value: token.value }
    } else {
      return null
    }
  },

  left (token, { expression }, left) {
    return { type: 'operator', value: '+', left, right: expression() }
  }
}

const subtraction: ExpressionProduction<{ type: '-' }> = {
  token: '-',

  null (_, { advance }) {
    const token = advance()

    if (token) {
      return { type: 'constant', value: token.value * -1 }
    } else {
      return null
    }
  },

  left (token, { expression }, left) {
    return { type: 'operator', value: '-', left, right: expression() }
  }
}

const ExpressionGrammar: Grammar<ExpressionToken, Expression> = [
  constant,
  multiplication,
  division,
  addition,
  subtraction
]

test(t => {
  function * tokens (): IterableIterator<ExpressionToken> {
    yield { type: 'number', value: 1 }
    yield { type: '*' }
    yield { type: 'number', value: 2 }
    yield { type: '+' }
    yield { type: 'number', value: 3 }
  }

  t.snapshot(parse(tokens(), ExpressionGrammar))
})
