import { bind } from "@alfa/util";
import { Token, WithLocation } from "./lexer";

const { isArray } = Array;

export type Predicate<T, U extends T> =
  | ((n: T) => boolean)
  | ((n: T) => n is U);

export class TokenStream<T extends Token> {
  private readonly _input: Array<T>;

  private _position: number = 0;

  public get position() {
    return this._position;
  }

  public constructor(input: Array<T>) {
    bind(this);
    this._input = input;
  }

  public restore(position: number): void {
    this._position = position;
  }

  public peek(offset: number = 0): T | null {
    const position = this._position + offset;

    if (position < this._input.length) {
      return this._input[position];
    }

    return null;
  }

  public advance(times: number = 1): boolean {
    let advanced = false;

    do {
      if (this._position < this._input.length) {
        advanced = true;
        this._position++;
      }
    } while (--times > 0);

    return advanced;
  }

  public backup(times: number = 1): boolean {
    let backedup = false;

    do {
      if (this._position > 0) {
        backedup = true;
        this._position--;
      }
    } while (--times > 0);

    return backedup;
  }

  public next(): T | null {
    const next = this.peek();
    this.advance();
    return next;
  }

  public accept<U extends T>(predicate: Predicate<T, U>): U | false {
    const next = this.peek();

    if (next !== null && predicate(next)) {
      this.advance();
      return next as U;
    }

    return false;
  }
}

export interface Production<
  T extends Token,
  R,
  U extends T = T,
  P extends R = R
> {
  readonly token: U["type"];
  readonly associate?: "left" | "right";
  prefix?(
    token: U,
    stream: TokenStream<T>,
    expression: () => R | null
  ): P | null;
  infix?(
    token: U,
    stream: TokenStream<T>,
    expression: () => R | null,
    left: R
  ): P | null;
}

export class Grammar<T extends Token, R> {
  private _entries: Map<
    T["type"],
    { production: Production<T, R>; precedence: number }
  > = new Map();

  public constructor(
    productions: Array<Production<T, R> | Array<Production<T, R>>>
  ) {
    for (let i = 0; i < productions.length; i++) {
      const precedence = productions.length - i;
      const group = productions[i];

      for (const production of isArray(group) ? group : [group]) {
        const { token } = production;

        this._entries.set(token, { production, precedence });
      }
    }
  }

  public get(
    token: T
  ): { production: Production<T, R>; precedence: number } | null {
    const entry = this._entries.get(token.type);

    if (entry === undefined) {
      return null;
    }

    return entry;
  }
}

export function parse<T extends Token, R>(
  input: Array<T>,
  grammar: Grammar<T, R>
): R | null {
  const stream = new TokenStream(input);

  function expression(power: number): R | null {
    const token = stream.peek();

    if (token === null) {
      return null;
    }

    const entry = grammar.get(token);

    if (entry === null) {
      return null;
    }

    const { production } = entry;

    if (production.prefix === undefined) {
      return null;
    }

    stream.advance();

    let left = production.prefix(token, stream, () => expression(-1));

    if (left === null) {
      return null;
    }

    while (stream.peek()) {
      const token = stream.peek();

      if (token === null) {
        break;
      }

      const entry = grammar.get(token);

      if (entry === null) {
        break;
      }

      const { production, precedence } = entry;

      if (production.infix === undefined) {
        break;
      }

      if (
        precedence < power ||
        (precedence === power && production.associate !== "right")
      ) {
        break;
      }

      stream.advance();

      left = production.infix(
        token,
        stream,
        () => expression(precedence),
        left
      );

      if (left === null) {
        return null;
      }
    }

    return left;
  }

  const result = expression(-1);
  const end = stream.peek();

  if (end !== null) {
    throw new Error(`Unexpected token "${end.type}"`);
  }

  return result;
}
