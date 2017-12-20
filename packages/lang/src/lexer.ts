import { Bound } from '@alfa/util'

const { assign } = Object

export interface Token {
  readonly type: string
}

export interface Location {
  readonly line: number
  readonly column: number
}

export type WithLocation<T extends Token> = T & Location

export function hasLocation<T extends Token> (token: T): token is WithLocation<T> {
  return 'line' in token && 'column' in token
}

class Stream extends Bound {
  private readonly _input: string

  private _position: number = 0
  private _start: number = 0
  private _line: number = 0
  private _column: number = 0

  public constructor (input: string) {
    super()
    this._input = input
  }

  public get input () {
    return this._input
  }

  public get position () {
    return this._position
  }

  public get line () {
    return this._line
  }

  public get column () {
    return this._column
  }

  public ignore (): void {
    this._start = this._position
  }

  public peek (offset: number = 0): string | null {
    const position = this._position + offset

    if (position < this._input.length) {
      return this._input.charAt(position)
    }

    return null
  }

  public value (): string {
    return this.input.substring(this._start, this._position)
  }

  public progressed (): boolean {
    return this._start !== this._position
  }

  public advance (times: number = 1): boolean {
    let advanced = false

    do {
      if (this._position < this._input.length) {
        advanced = true

        const next = this.peek()

        if (next === null) {
          break
        }

        if (isNewline(next)) {
          this._line++
          this._column = 0
        } else {
          this._column++
        }

        this._position++
      }
    } while (--times > 0)

    return advanced
  }

  public backup (times: number = 1): boolean {
    let backedup = false

    do {
      if (this._position > 0) {
        backedup = true

        const next = this.peek()

        if (next === null) {
          break
        }

        if (isNewline(next)) {
          this._line--
          this._column = 0
        } else {
          this._column--
        }

        this._position--
      }
    } while (--times > 0)

    return backedup
  }

  public restore (position: number): void {
    const difference = position - this._position

    if (difference > 0) {
      this.advance(difference)
    }

    if (difference < 0) {
      this.backup(difference * -1)
    }
  }

  public next (): string | null {
    const next = this.peek()
    this.advance()
    return next
  }

  public accept (predicate: (char: string) => boolean): boolean {
    let accepted = false
    let next = this.peek()

    while (next !== null && predicate(next)) {
      accepted = true

      if (!this.advance()) {
        break
      }

      next = this.peek()
    }

    return accepted
  }

  public match (pattern: string): boolean {
    const regex = new RegExp(pattern, 'y')

    regex.lastIndex = this._position

    if (regex.test(this._input) && regex.lastIndex !== this._position) {
      this._position = regex.lastIndex

      return true
    }

    return false
  }
}

export type Pattern<T extends Token> = (stream: Stream) => T | void

export type Alphabet<T extends Token> = Array<Pattern<T>>

export function lex<T extends Token> (input: string, alphabet: Alphabet<T>): Array<WithLocation<T>> {
  const tokens: Array<WithLocation<T>> = []
  const stream = new Stream(input)

  outer: while (stream.position < input.length) {
    for (let i = 0; i < alphabet.length; i++) {
      const pattern = alphabet[i]
      const position = stream.position
      const line = stream.line
      const column = stream.column
      const token = pattern(stream)

      if (token) {
        stream.ignore()

        tokens.push(assign(token, { line, column }))

        continue outer
      }

      if (position !== stream.position) {
        stream.restore(position)
      }
    }

    throw new Error(`Unexpected character "${stream.peek()}"`)
  }

  return tokens
}

export function isBetween (char: string, lower: string, upper: string): boolean {
  return char >= lower && char <= upper
}

export function isWhitespace (char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n'
}

export function isNewline (char: string): boolean {
  return char === '\n' || char === '\r' || char === '\f'
}

export function isAlpha (char: string): boolean {
  return isBetween(char, 'a', 'z') || isBetween(char, 'A', 'Z')
}

export function isNumeric (char: string): boolean {
  return isBetween(char, '0', '9')
}

export function isAlphanumeric (char: string): boolean {
  return isAlpha(char) || isNumeric(char)
}

export function isHex (char: string): boolean {
  return isNumeric(char) || isBetween(char, 'a', 'f') || isBetween(char, 'A', 'F')
}

export function isAscii (char: string): boolean {
  return char.charCodeAt(0) < 0x80
}

export function isNonAscii (char: string): boolean {
  return !isAscii(char)
}
