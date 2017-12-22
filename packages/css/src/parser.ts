import { Grammar, Production, parse as $parse } from '@alfa/lang'
import { CssToken, Whitespace, Comment, Delim, Ident, Comma, isIdent, lex } from './lexer'

export type Combinator = '>>' | '>' | '+' | '~'

export type TypeSelector = { type: 'type-selector', name: string }
export type ClassSelector = { type: 'class-selector', name: string }
export type IdSelector = { type: 'id-selector', name: string }

export type SimpleSelector = TypeSelector | ClassSelector | IdSelector
export type CompoundSelector = { type: 'compound-selector', selectors: Array<SimpleSelector> }

export type Selector = SimpleSelector | CompoundSelector
export type SelectorList = { type: 'selector-list', selectors: Array<Selector> }

export type CssTree =
    Selector
  | SelectorList

type CssProduction<T extends CssToken, U extends CssTree> = Production<CssToken, T, CssTree, U>

function isSimpleSelector (node: CssTree): node is SimpleSelector {
  switch (node.type) {
    case 'type-selector':
    case 'class-selector':
    case 'id-selector':
      return true
    default:
      return false
  }
}

function isSelector (node: CssTree): node is Selector {
  return isSimpleSelector(node) || node.type === 'compound-selector'
}

function isSelectorList (node: CssTree): node is SelectorList {
  return node.type === 'selector-list'
}

const whitespace: CssProduction<Whitespace, CssTree> = {
  token: 'whitespace',

  prefix (token, stream, expression) {
    return expression()
  },

  infix (token, stream, expression, left) {
    return left
  }
}

const comment: CssProduction<Comment, CssTree> = {
  token: 'comment',

  prefix (token, stream, expression) {
    return expression()
  },

  infix (token, stream, expression, left) {
    return left
  }
}

const delim: CssProduction<Delim, Selector> = {
  token: 'delim',

  prefix (token, { accept }) {
    switch (token.value) {
      case '.':
      case '#':
        const ident = accept(isIdent)

        if (ident === false) {
          throw new Error('Expected ident')
        }

        const name = ident.value
        return token.value === '.'
          ? { type: 'class-selector', name }
          : { type: 'id-selector', name }
    }

    return null
  },

  infix (token, stream, expression, left) {
    if (isSelector(left)) {
      stream.backup()

      const right = expression()

      if (right === null || !isSimpleSelector(right)) {
        throw new Error('Expected simple selector')
      }

      return {
        type: 'compound-selector',
        selectors: left.type === 'compound-selector'
          ? [...left.selectors, right]
          : [left, right]
      }
    }

    return null
  }
}

const ident: CssProduction<Ident, TypeSelector> = {
  token: 'ident',

  prefix (token) {
    return { type: 'type-selector', name: token.value }
  }
}

const comma: CssProduction<Comma, SelectorList> = {
  token: ',',

  infix (token, stream, expression, left) {
    const selectors: Array<Selector> = []

    if (isSimpleSelector(left)) {
      selectors.push(left)
    }

    const right = expression()

    if (right === null) {
      throw new Error('Expected selector')
    }

    if (isSelector(right)) {
      selectors.push(right)
    }

    if (isSelectorList(right)) {
      selectors.push.apply(selectors, right.selectors)
    }

    return { type: 'selector-list', selectors }
  }
}

export const CssGrammar: Grammar<CssToken, CssTree> = [
  whitespace,
  comment,
  delim,
  ident,
  comma
]

export function parse (input: string): CssTree | null {
  return $parse(lex(input), CssGrammar)
}
