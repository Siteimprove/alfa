import { Bound, isNewline } from "@alfa/util";

// Expose string utilities to consumers of @alfa/lang as a convenience. Packages
// that implement lexers will most likely need one or more of these and getting
// them within the same import is neat.
export {
  isAlpha,
  isAlphanumeric,
  isAscii,
  isBetween,
  isHex,
  isNewline,
  isNumeric,
  isWhitespace
} from "@alfa/util";

export interface Token {
  readonly type: string;
}

export interface Location {
  readonly line: number;
  readonly column: number;
}

export type WithLocation<T extends Token> = T &
  Readonly<{ location: Readonly<{ start: Location; end: Location }> }>;

export function hasLocation<T extends Token>(
  token: T
): token is WithLocation<T> {
  return "line" in token && "column" in token;
}

export class CharacterStream extends Bound {
  private readonly _input: string;

  private _position: number = 0;
  private _start: number = 0;
  private _line: number = 0;
  private _column: number = 0;

  public constructor(input: string) {
    super();
    this._input = input;
  }

  public get input() {
    return this._input;
  }

  public get position() {
    return this._position;
  }

  public get line() {
    return this._line;
  }

  public get column() {
    return this._column;
  }

  public ignore(): void {
    this._start = this._position;
  }

  public peek(offset: number = 0): string | null {
    const position = this._position + offset;

    if (position < this._input.length) {
      return this._input[position];
    }

    return null;
  }

  public result(): string {
    return this.input.substring(this._start, this._position);
  }

  public progressed(): boolean {
    return this._start !== this._position;
  }

  public advance(times: number = 1): boolean {
    let advanced = false;

    do {
      if (this._position < this._input.length) {
        advanced = true;

        const next = this.peek();

        if (next !== null && isNewline(next)) {
          this._line++;
          this._column = 0;
        } else {
          this._column++;
        }

        this._position++;
      } else break;
    } while (--times > 0);

    return advanced;
  }

  public backup(times: number = 1): boolean {
    let backedup = false;

    do {
      if (this._position > 0) {
        backedup = true;

        const prev = this.peek(-1);

        if (prev !== null && isNewline(prev)) {
          this._line--;
          this._column = 0;
        } else {
          this._column--;
        }

        this._position--;
      } else break;
    } while (--times > 0);

    return backedup;
  }

  public restore(position: number): void {
    const difference = position - this._position;

    if (difference > 0) {
      this.advance(difference);
    }

    if (difference < 0) {
      this.backup(difference * -1);
    }
  }

  public next(): string | null {
    const next = this.peek();
    this.advance();
    return next;
  }

  public accept(predicate: (char: string) => boolean, times?: number): boolean {
    let accepted = false;
    let next = this.peek();

    while (
      next !== null &&
      predicate(next) &&
      (times === undefined || times-- > 0)
    ) {
      accepted = times === undefined || times === 0;

      if (!this.advance()) {
        break;
      }

      next = this.peek();
    }

    return accepted;
  }

  public match(pattern: string): boolean {
    const regex = new RegExp(pattern, "y");

    regex.lastIndex = this._position;

    if (regex.test(this._input) && regex.lastIndex !== this._position) {
      this._position = regex.lastIndex;

      return true;
    }

    return false;
  }

  public location(): Location {
    return { line: this.line, column: this.column };
  }
}

export type Pattern<T extends Token, S> = (
  stream: CharacterStream,
  emit: <U extends T>(token: WithLocation<U>) => void,
  state: S,
  end: () => void
) => Pattern<T, S> | void;

export type Alphabet<T extends Token, S> = (
  stream: CharacterStream
) => [Pattern<T, S>, S];

export function lex<T extends Token>(
  input: string,
  alphabet: Alphabet<T, any>
): Array<WithLocation<T>> {
  const tokens: Array<WithLocation<T>> = [];
  const stream = new CharacterStream(input);

  let { line, column } = stream;
  let done = false;

  function emit<U extends T>(token: WithLocation<U>): void {
    tokens.push(token);
  }

  function end() {
    done = true;
  }

  let [pattern, state] = alphabet(stream);

  while (!done) {
    pattern = pattern(stream, emit, state, end) || pattern;
  }

  return tokens;
}
