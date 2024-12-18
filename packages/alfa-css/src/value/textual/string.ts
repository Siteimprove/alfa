import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#strings}
 *
 * @public
 */
export class String
  extends Value<"string", false>
  implements Resolvable<String, never>
{
  public static of(value: string): String {
    return new String(value);
  }

  private readonly _value: string;

  protected constructor(value: string) {
    super("string", false);
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public resolve(): String {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof String && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._value);
  }

  public toJSON(): String.JSON {
    return {
      ...super.toJSON(),
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

  export const parse: CSSParser<String> = map(Token.parseString(), (string) =>
    String.of(string.value),
  );
}
