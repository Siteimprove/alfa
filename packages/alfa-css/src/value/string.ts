import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../syntax";
import { Value } from "../value";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#strings}
 *
 * @public
 */
export class String extends Value<"string"> {
  public static of(value: string): String {
    return new String(value);
  }

  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  public get type(): "string" {
    return "string";
  }

  public get value(): string {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof String && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._value);
  }

  public toJSON(): String.JSON {
    return {
      type: "string",
      value: this._value,
    };
  }

  public toString(): string {
    return `"${this._value.replace(/"/g, '\\"')}"`;
  }
}

/**
 * @public
 */
export namespace String {
  export interface JSON extends Value.JSON<"string"> {
    value: string;
  }

  export function isString(value: unknown): value is String {
    return value instanceof String;
  }

  export const parse: Parser<
    Slice<Token>,
    String,
    string
  > = map(Token.parseString(), (string) => String.of(string.value));
}
