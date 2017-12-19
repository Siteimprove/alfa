import { Grammar, Production } from '@alfa/lang'
import { CssToken, isIdent } from './lexer'

export type ClassSelector = { type: 'class-selector', name: string }
export type IdSelector = { type: 'id-selector', name: string }
export type SelectorList = { type: 'selector-list', selectors: Array<ClassSelector | IdSelector> }

export type CssTree =
    ClassSelector
  | IdSelector
  | SelectorList

type CssProduction<T extends CssToken, U extends CssTree> = Production<CssToken, T, CssTree, U>

const whitespace: CssProduction<{ type: 'whitespace' }, CssTree> = {
  token: 'whitespace',

  prefix (token, stream, expression) {
    return expression()
  },

  infix (token, stream, expression, left) {
    return left
  }
}

const delim: CssProduction<{ type: 'delim', value: string }, ClassSelector | IdSelector> = {
  token: 'delim',

  prefix (token, { accept, advance }) {
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
  }
}

const comma: CssProduction<{ type: ',' }, SelectorList> = {
  token: ',',

  infix (token, stream, expression, left) {
    let selectors = []

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
  delim,
  comma
]
