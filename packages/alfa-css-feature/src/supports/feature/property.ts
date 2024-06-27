import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import type { Feature } from "../../feature.js";

const { delimited, map, option, separated } = Parser;

/**
 * @public
 */
export class Property<N extends string = string>
  implements Feature<Property<N>>
{
  public static of<N extends string>(name: N, value: string): Property<N> {
    return new Property(name, value);
  }

  private readonly _name: N;
  private readonly _value: string;

  private constructor(name: N, value: string) {
    this._name = name;
    this._value = value;
  }

  public get name(): N {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  public matches(): boolean {
    // We pretend to support all standard CSS properties.
    // When this is not the case, and it impacts our audit, we need to
    // add support for the missing property…
    // https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix

    // The value might be totally invalid. We assume this won't create problem,
    // that is nobody is relying on a @supports rule with invalid value being
    // rejected to ensure their styling.
    return !this._name.startsWith("-");
  }

  public *iterator(): Iterator<Property<N>> {
    yield this;
  }

  public [Symbol.iterator](): Iterator<Property<N>> {
    return this.iterator();
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Property &&
      value._name === this._name &&
      value._value === this._value
    );
  }

  public toJSON(): Property.JSON<N> {
    return {
      type: "property",
      name: this._name,
      value: this._value,
    };
  }

  public toString(): string {
    return `${this._name}: ${this._value}`;
  }
}

/**
 * @public
 */
export namespace Property {
  export interface JSON<N extends string = string> {
    [key: string]: json.JSON;

    type: "property";
    name: N;
    value: string;
  }

  export function isProperty<N extends string>(
    value: unknown,
  ): value is Property<N> {
    return value instanceof Property;
  }

  /**
   * @remarks
   * We do not want to actually parse the value at this point, since it would
   * create a circular dependency with `siteimprove/alfa-style` who knows about
   * this.
   * Therefore, we accept any OK-ish string as a decent value… This creates challenges
   * to be reasonably sure that the value is actually terminated.
   *
   * As per grammar, the declaration is enclosed in parentheses. So we stop as soon as we've seen
   * more `)` than `(`.
   */
  const parseValue: CSSParser<string> = (input) => {
    let count = 0;
    let value = "";
    let rest = input;

    while (!rest.isEmpty()) {
      const token = rest.first().getUnsafe();

      if (Token.isOpenParenthesis(token) || Token.isFunction(token)) {
        count++;
      } else if (Token.isCloseParenthesis(token)) {
        count--;
      }

      if (count < 0) {
        break;
      }

      // Do not consume the last closing parenthesis.
      rest = rest.rest();
      value += token.toString();
    }

    return count < 0
      ? Ok.of<[Slice<Token>, string]>([rest, value.trim()])
      : Err.of("Unexpected end of input");
  };

  export const parse = map(
    separated(
      Token.parseIdent(),
      delimited(option(Token.parseWhitespace), Token.parseColon),
      parseValue,
    ),
    ([name, value]) => Property.of(name.value, value),
  );
}
