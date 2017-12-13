import {
  Pattern,
  lex,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isNonAscii
} from '@alfa/lang'

/**
 * @see https://www.w3.org/TR/css-syntax/#tokenization
 */
export type CssToken =
    { type: 'whitespace' }

  // Value tokens
  | { type: 'comment', value: string }
  | { type: 'ident', value: string }
  | { type: 'string', value: string }
  | { type: 'delim', value: string }
  | { type: 'number', value: number }

  // Character tokens
  | { type: '(' } | { type: ')' }
  | { type: '[' } | { type: ']' }
  | { type: '{' } | { type: '}' }
  | { type: ',' }
  | { type: ':' }
  | { type: ';' }

export type CssPattern = Pattern<CssToken>

const whitespace: CssPattern = stream => {
  if (stream.accept(isWhitespace)) {
    return { type: 'whitespace' }
  }
}

const character: CssPattern = stream => {
  const char = stream.next()

  switch (char) {
    case '(': return { type: char }
    case ')': return { type: char }
    case '[': return { type: char }
    case ']': return { type: char }
    case '{': return { type: char }
    case '}': return { type: char }
    case ',': return { type: char }
    case ':': return { type: char }
    case ';': return { type: char }
  }
}

const comment: CssPattern = stream => {
  if (stream.next() === '/' && stream.next() === '*') {
    stream.ignore()

    if (stream.accept(() => stream.peek() !== '*' || stream.peek(1) !== '/')) {
      const value = stream.value()

      stream.advance(2)

      return { type: 'comment', value }
    }
  }
}

const ident: CssPattern = stream => {
  if (stream.peek() === '-') {
    stream.advance()
  }

  if (stream.accept(char => isAlpha(char) || isNonAscii(char) || char === '_')) {
    stream.accept(char => isAlphanumeric(char) || isNonAscii(char) || char === '_' || char === '-')

    if (stream.progressed()) {
      return {
        type: 'ident',
        value: stream.value()
      }
    }
  }
}

const string: CssPattern = stream => {
  const end = stream.next()

  if (end === '"' || end === '\'') {
    stream.ignore()

    if (stream.accept(char => char !== '"' && char !== '\'')) {
      const value = stream.value()

      stream.advance()

      return { type: 'string', value }
    }
  }
}

const number: CssPattern = stream => {
  if (stream.peek() === '+' || stream.peek() === '-') {
    stream.advance()
  }

  stream.accept(isNumeric)

  if (stream.peek() === '.' && isNumeric(stream.peek(1))) {
    stream.advance()
    stream.accept(isNumeric)
  }

  if (stream.peek() === 'E' || stream.peek() === 'e') {
    let offset = 1

    if (stream.peek(1) === '-' || stream.peek(1) === '+') {
      offset = 2
    }

    if (isNumeric(stream.peek(offset))) {
      stream.advance(offset)
      stream.accept(isNumeric)
    }
  }

  if (stream.progressed()) {
    return {
      type: 'number',
      value: Number(stream.value())
    }
  }
}

const delim: CssPattern = stream => {
  return { type: 'delim', value: stream.next() }
}

export const CssPatterns = [
  whitespace,
  character,
  comment,
  ident,
  string,
  number,
  delim
]
