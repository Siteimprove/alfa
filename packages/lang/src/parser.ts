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

export interface Production<T extends Token, U extends T, R, P extends R> {
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

export type Grammar<T extends Token, R> = Array<
  Production<T, T, R, R> | Array<Production<T, T, R, R>>
>;

export function parse<T extends Token, R>(
  input: Array<T>,
  grammar: Grammar<T, R>
): R | null {
  const productions: Map<
    T["type"],
    Production<T, T, R, R> & { precedence: number }
  > = new Map();
  const stream = new TokenStream(input);

  for (let i = 0; i < grammar.length; i++) {
    const precedence = grammar.length - i;
    const group = grammar[i];

    for (const production of isArray(group) ? group : [group]) {
      productions.set(production.token, { ...production, precedence });
    }
  }

  function expression(precedence: number): R | null {
    let token = stream.peek();

    if (token === null) {
      return null;
    }

    let production = productions.get(token.type);

    if (production === undefined || production.prefix === undefined) {
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

      production = productions.get(token.type);

      if (production === undefined || production.infix === undefined) {
        throw new Error(`Unexpected token '${token.type}' in infix position`);
      }

      if (
        production.precedence < precedence ||
        (production.precedence === precedence &&
          production.associate !== "right")
      ) {
        break;
      }

      stream.advance();

      left = production.infix(
        token,
        stream,
        expression.bind(null, production.precedence),
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
