import { Grammar, Production } from '@alfa/lang'
import { CssToken, isIdent } from './lexer'

export type ClassSelector = { type: 'class-selector', name: string }
export type IdSelector = { type: 'id-selector', name: string }

export type CssTree =
    ClassSelector
  | IdSelector

type CssProduction<T extends CssToken, U extends CssTree> = Production<CssToken, T, U>

const delim: CssProduction<{ type: 'delim', value: string }, ClassSelector | IdSelector> = {
  token: 'delim',

  null (token, { accept, advance }) {
    switch (token.value) {
      case '.':
      case '#':
        const ident = accept(isIdent)

        if (ident) {
          return token.value === '.'
            ? { type: 'class-selector', name: ident.value }
            : { type: 'id-selector', name: ident.value }
        }
    }
  }
}

export const CssGrammar: Grammar<CssToken, CssTree> = [
  delim
]
