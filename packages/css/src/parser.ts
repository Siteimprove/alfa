import { Grammar, Production } from '@alfa/lang'
import { CssToken, isIdent } from './lexer'

export type Combinator = '>>' | '>' | '+' | '~'

export type ClassSelector = { type: 'class-selector', name: string }
export type IdSelector = { type: 'id-selector', name: string }
export type CompoundSelector = { type: 'compound-selector', selectors: Array<ClassSelector | IdSelector> }

export type Selector = ClassSelector | IdSelector | CompoundSelector
export type SelectorList = { type: 'selector-list', selectors: Array<Selector> }

export type CssTree =
    ClassSelector
  | IdSelector
  | CompoundSelector
  | SelectorList

type CssProduction<T extends CssToken, U extends CssTree> = Production<CssToken, T, CssTree, U>

function isSimpleSelector (node: CssTree): node is ClassSelector | IdSelector {
  switch (node.type) {
    case 'class-selector':
    case 'id-selector':
      return true
    default:
      return false
  }
}

const whitespace: CssProduction<{ type: 'whitespace' }, CssTree> = {
  token: 'whitespace',

  prefix (token, stream, expression) {
    return expression()
  },

  infix (token, stream, expression, left) {
    return left
  }
}

const comment: CssProduction<{ type: 'comment', value: string }, CssTree> = {
  token: 'comment',

  prefix (token, stream, expression) {
    return expression()
  },

  infix (token, stream, expression, left) {
    return left
  }
}

const delim: CssProduction<{ type: 'delim', value: string }, ClassSelector | IdSelector | CompoundSelector> = {
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
    switch (left.type) {
      case 'id-selector':
      case 'class-selector':
      case 'compound-selector':
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

const comma: CssProduction<{ type: ',' }, SelectorList> = {
  token: ',',

  infix (token, stream, expression, left) {
    const selectors: Array<Selector> = []

    switch (left.type) {
      case 'id-selector':
      case 'class-selector':
        selectors.push(left)
    }

    const right = expression()

    if (right === null) {
      throw new Error('Expected selector')
    }

    switch (right.type) {
      case 'id-selector':
      case 'class-selector':
      case 'compound-selector':
        selectors.push(right)
        break

      case 'selector-list':
        selectors.push.apply(selectors, right.selectors)
    }

    return { type: 'selector-list', selectors }
  }
}

export const CssGrammar: Grammar<CssToken, CssTree> = [
  whitespace,
  comment,
  delim,
  comma
]
