import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../syntax/token";
import { Value } from "../value";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#strings
 */
export class String<T extends string = string> extends Value<"string"> {
  public static of<T extends string = string>(value: T): String<T> {
    return new String(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    super();
    this._value = value;
  }

  public get type(): "string" {
    return "string";
  }

  public get value(): T {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof String && value._value === this._value;
  }

  public hash(hash: Hash): void {
    Hash.writeString(hash, this._value);
  }

  public toJSON(): String.JSON<T> {
    return {
      type: "string",
      value: this._value,
    };
  }

  public toString(): string {
    return `"${this._value.replace(/"/g, '\\"')}"`;
  }
}

export namespace String {
  export interface JSON<T extends string = string>
    extends Value.JSON<"string"> {
    value: T;
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
