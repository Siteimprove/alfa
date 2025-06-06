import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import type * as json from "@siteimprove/alfa-json";

import { Component } from "./component.js";
import type { Parser as CSSParser } from "./parser.js";
import { Token } from "./token.js";

const { not } = Predicate;
const { option, delimited, left, zeroOrMore, map, pair, flatMap } = Parser;

/**
 * {@link https://drafts.csswg.org/css-syntax/#declaration}
 *
 * @public
 */
export class Declaration implements Iterable<Token>, Equatable, Serializable {
  public static of(
    name: string,
    value: Iterable<Token>,
    important = false,
  ): Declaration {
    return new Declaration(name, Array.from(value), important);
  }

  private readonly _name: string;
  private readonly _value: Array<Token>;
  private readonly _important: boolean;

  protected constructor(name: string, value: Array<Token>, important: boolean) {
    this._name = name;
    this._value = value;
    this._important = important;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public get important(): boolean {
    return this._important;
  }

  public *[Symbol.iterator](): Iterator<Token> {
    // <name>:
    yield Token.Ident.of(this._name);
    yield Token.Colon.of();

    // <value>
    yield* this._value;

    if (this._important) {
      // !important
      yield Token.Delim.of(0x21);
      yield Token.Ident.of("important");
    }
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Declaration &&
      value._name === this._name &&
      value._important === this._important &&
      value._value.length === this._value.length &&
      value._value.every((token, i) => token.equals(this._value[i]))
    );
  }

  public toJSON(): Declaration.JSON {
    return {
      name: this._name,
      value: this._value.map((token) => token.toJSON()),
      important: this._important,
    };
  }

  public toString(): string {
    return `${this._name}: ${this._value}${
      this._important ? " !important" : ""
    }`;
  }
}

/**
 * @public
 */
export namespace Declaration {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: Array<Token.JSON>;
    important: boolean;
  }

  /**
   * {@link https://drafts.csswg.org/css-syntax/#consume-a-declaration}
   */
  export const consume: CSSParser<Declaration> = flatMap(
    pair(
      left(
        Token.parseIdent(),
        delimited(option(Token.parseWhitespace), Token.parseColon),
      ),
      map(zeroOrMore(Component.consume), (components) =>
        components.flatMap((component) => [...component]),
      ),
    ),
    ([{ value: name }, value]) =>
      (input) => {
        let important = false;

        if (value.length >= 2) {
          const fst = value[value.length - 2];
          const snd = value[value.length - 1];

          if (
            fst.type === "delim" &&
            fst.value === 0x21 &&
            snd.type === "ident" &&
            snd.value.toLowerCase() === "important"
          ) {
            value.splice(value.length - 2, 2);
            important = true;
          }
        }

        if (value.length >= 1) {
          const lst = value[value.length - 1];

          if (lst.type === "whitespace") {
            value.pop();
          }
        }

        return Result.of<[Slice<Token>, Declaration], string>([
          input,
          Declaration.of(name, value, important),
        ]);
      },
  );

  /**
   * {@link https://drafts.csswg.org/css-syntax/#parse-a-declaration}
   */
  export const parse: CSSParser<Declaration> = (input) => {
    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    const next = input.get(0);

    if (next.none(Token.isIdent)) {
      return Err.of("Expected an ident");
    }

    return consume(input);
  };

  /**
   * {@link https://drafts.csswg.org/css-syntax/#consume-a-list-of-declarations}
   */
  export const consumeList: CSSParser<Iterable<Declaration>> = (input) => {
    const declarations: Array<Declaration> = [];

    while (input.length > 0) {
      for (const next of input.get(0)) {
        input = input.slice(1);

        if (Token.isWhitespace(next) || Token.isSemicolon(next)) {
          continue;
        }

        if (Token.isIdent(next)) {
          const value: Array<Token> = [next];

          while (input.get(0).some(not(Token.isSemicolon))) {
            // Component.consume returns Ok while input is non-empty
            const [remainder, component] = Component.consume(input).getUnsafe();

            input = remainder;
            value.push(...component);
          }

          const result = consume(Slice.of(value));

          if (result.isOk()) {
            declarations.push(result.get()[1]);
          }
        } else {
          while (input.get(0).some(not(Token.isSemicolon))) {
            // Component.consume returns Ok while input is non-empty
            const [remainder] = Component.consume(input).getUnsafe();

            input = remainder;
          }
        }
      }
    }

    return Result.of([input, declarations]);
  };

  /**
   * {@link https://drafts.csswg.org/css-syntax/#parse-a-list-of-declarations}
   */
  export const parseList: CSSParser<Iterable<Declaration>> = consumeList;
}
