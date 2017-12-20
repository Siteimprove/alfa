import {
  Pattern,
  Alphabet,
  lex,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isNonAscii
} from '@alfa/lang'

export type Whitespace = { type: 'whitespace' }

export type Comment = { type: 'comment', value: string }
export type Ident = { type: 'ident', value: string }
export type String = { type: 'string', value: string }
export type Delim = { type: 'delim', value: string }
export type Number = { type: 'number', value: number }

export type Paren = { type: '(' | ')' }
export type Bracket = { type: '[' | ']' }
export type Brace = { type: '{' | '}' }
export type Comma = { type: ',' }
export type Colon = { type: ':' }
export type Semicolon = { type: ';' }

/**
 * @see https://www.w3.org/TR/css-syntax/#tokenization
 */
export type CssToken =
  | Whitespace

  // Value tokens
  | Comment
  | Ident
  | String
  | Delim
  | Number

  // Character tokens
  | Paren
  | Bracket
  | Brace
  | Comma
  | Colon
  | Semicolon

export function isIdent (token: CssToken): token is Ident {
  return token.type === 'ident'
}

export type CssPattern<T extends CssToken> = Pattern<T>

const whitespace: CssPattern<Whitespace> = ({ accept }) => {
  if (accept(isWhitespace)) {
    return { type: 'whitespace' }
  }
}

const character: CssPattern<Paren | Bracket | Brace | Comma | Colon | Semicolon> = ({ next }) => {
  const char = next()

  switch (char) {
    case '(': case ')': return { type: char }
    case '[': case ']': return { type: char }
    case '{': case '}': return { type: char }

    case ',': return { type: char }
    case ':': return { type: char }
    case ';': return { type: char }
  }
}

const comment: CssPattern<Comment> = ({ next, ignore, accept, peek, result, advance }) => {
  if (next() === '/' && next() === '*') {
    ignore()

    if (accept(() => peek() !== '*' || peek(1) !== '/')) {
      const value = result()

      advance(2)

      return { type: 'comment', value }
    }
  }
}

const ident: CssPattern<Ident> = ({ peek, advance, accept, progressed, result }) => {
  if (!accept(char => char === '-', 2)) {
    if (peek() === '-') {
      advance()
    }

    if (!accept(char => isAlpha(char) || isNonAscii(char) || char === '_')) {
      return
    }
  }

  accept(char => isAlphanumeric(char) || isNonAscii(char) || char === '_' || char === '-')

  if (progressed()) {
    return { type: 'ident', value: result() }
  }
}

const string: CssPattern<String> = ({ next, ignore, accept, result, advance }) => {
  const end = next()

  if (end === '"' || end === '\'') {
    ignore()

    if (accept(char => char !== '"' && char !== '\'')) {
      const value = result()

      advance()

      return { type: 'string', value }
    }
  }
}

const number: CssPattern<Number> = ({ peek, advance, accept, progressed, result }) => {
  if (peek() === '+' || peek() === '-') {
    advance()
  }

  accept(isNumeric)

  if (peek() === '.' && isNumeric(peek(1))) {
    advance() && accept(isNumeric)
  }

  if (peek() === 'E' || peek() === 'e') {
    let offset = 1

    if (peek(1) === '-' || peek(1) === '+') {
      offset = 2
    }

    if (isNumeric(peek(offset))) {
      advance(offset) && accept(isNumeric)
    }
  }

  if (progressed()) {
    return { type: 'number', value: Number(result()) }
  }
}

const delim: CssPattern<Delim> = ({ next }) => {
  const char = next()

  if (char) {
    return { type: 'delim', value: char }
  }
}

export const CssAlphabet: Alphabet<CssToken> = [
  whitespace,
  character,
  comment,
  ident,
  string,
  number,
  delim
]
