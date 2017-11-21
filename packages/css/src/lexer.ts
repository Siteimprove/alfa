import {
  Lexer,
  Pattern,
  lex,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNonAscii
} from '@endal/lang'

/**
 * @see https://www.w3.org/TR/css-syntax-3/#tokenization
 */
export type CssToken =
    { type: 'whitespace' }
  | { type: 'comment', value: string }
  | { type: 'ident', value: string }
  | { type: 'hash', value: string }
  | { type: 'string', value: string }
  | { type: 'number', value: number }

export type CssPattern = Pattern<CssToken>

const whitespace: CssPattern = stream => {
  if (stream.accept(isWhitespace)) {
    return { type: 'whitespace' }
  }
}

const comment: CssPattern = stream => {
  if (stream.next() === '/' && stream.next() === '*') {
    stream.ignore()

    if (stream.accept(() => stream.peek() !== '*' || stream.peek(1) !== '/')) {
      const value = stream.value()

      stream.advance(2)
      stream.ignore()

      return { type: 'comment', value }
    }
  }
}

const ident: CssPattern = stream => {
  if (stream.peek() === '-') {
    stream.advance()
  }

  if (
    !stream.accept(char =>
      isAlpha(char) ||
      isNonAscii(char) ||
      char === '_'
    )
  ) {
    return
  }

  stream.accept(char =>
    isAlphanumeric(char) ||
    isNonAscii(char) ||
    char === '_'
  )

  if (stream.progressed()) {
    return {
      type: 'ident',
      value: stream.value()
    }
  }
}

export class CssLexer implements Lexer<CssToken> {
  private readonly input: string

  constructor (input: string) {
    this.input = input
  }

  [Symbol.iterator] (): Iterator<CssToken> {
    return lex(this.input, [
      whitespace,
      comment,
      ident
    ])
  }
}
