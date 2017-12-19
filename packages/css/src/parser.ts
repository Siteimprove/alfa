import { Grammar, Production } from '@alfa/lang'
import { CssToken, isIdent } from './lexer'

export type ClassSelector = { type: 'class-selector', name: string }
export type IdSelector = { type: 'id-selector', name: string }

export type CssTree =
    ClassSelector
  | IdSelector

type CssProduction<T extends CssToken, U extends CssTree> = Production<CssToken, T, U>

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
  }
}

export const CssGrammar: Grammar<CssToken, CssTree> = [
  whitespace,
  delim
]
