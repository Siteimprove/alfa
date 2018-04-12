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

  public production(token: T): Production<T, R> {
    const entry = this._entries.get(token.type);

    if (entry === undefined) {
      throw new Error(`No production defined for token "${token.type}"`);
    }

    return entry.production;
  }

  public precedence(token: T): number {
    const entry = this._entries.get(token.type);

    if (entry === undefined) {
      throw new Error(`No production defined for token "${token.type}"`);
    }

    return entry.precedence;
  }
}

export function parse<T extends Token, R>(
  input: Array<T>,
  grammar: Grammar<T, R>
): R | null {
  const stream = new TokenStream(input);

  function expression(precedence: number): R | null {
    let token = stream.peek();

    if (token === null) {
      return null;
    }

    let production = grammar.production(token);

    if (production.prefix === undefined) {
      throw new Error(`Unexpected token '${token.type}' in prefix position`);
    }

    stream.advance();

    let left = production.prefix(token, stream, expression.bind(null, -1));

    if (left === null) {
      return null;
    }

    while (stream.peek()) {
      token = stream.peek();

      if (token === null) {
        return null;
      }

      production = grammar.production(token);

      if (production.infix === undefined) {
        throw new Error(`Unexpected token '${token.type}' in infix position`);
      }

      if (
        grammar.precedence(token) < precedence ||
        (grammar.precedence(token) === precedence &&
          production.associate !== "right")
      ) {
        break;
      }

      stream.advance();

      left = production.infix(
        token,
        stream,
        expression.bind(null, grammar.precedence(token)),
        left
      );

      if (left === null) {
        return null;
      }
    }

    return left;
  }

  return expression(-1);
}
