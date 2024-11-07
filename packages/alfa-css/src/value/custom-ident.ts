import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import { type Parser as CSSParser, Token } from "../syntax/index.js";
import type { Resolvable } from "./resolvable.js";
import { Value } from "./value.js";

const { map, parseIf } = Parser;
const { and } = Predicate;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident}
 *
 * @public
 */
export class CustomIdent
  extends Value<"custom-ident", false>
  implements Resolvable<CustomIdent, never>
{
  public static of(value: string): CustomIdent {
    return new CustomIdent(value);
  }

  private readonly _value: string;

  private constructor(value: string) {
    super("custom-ident", false);
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public resolve(): CustomIdent {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof CustomIdent && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._value);
  }

  public toJSON(): CustomIdent.JSON {
    return {
      ...super.toJSON(),
      value: this._value,
    };
  }

  public toString(): string {
    return this._value;
  }
}

/**
 * @public
 */
export namespace CustomIdent {
  export interface JSON extends Value.JSON<"custom-ident"> {
    value: string;
  }

  export function isCustomIdent(value: unknown): value is CustomIdent {
    return value instanceof CustomIdent;
  }

  export function parse(
    predicate: Predicate<CustomIdent> = () => true,
  ): CSSParser<CustomIdent> {
    return parseIf(
      and(isCustomIdent, predicate),
      map(Token.parseIdent(), (ident) => CustomIdent.of(ident.value)),
      () => "Invalid custom-ident",
    );
  }
}
