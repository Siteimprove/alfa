import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import { type Parser as CSSParser, Token } from "../syntax/index.js";

import type { Resolvable } from "./resolvable.js";
import { Value } from "./value.js";

const { map } = Parser;
const { equals } = Predicate;

/**
 * {@link https://drafts.csswg.org/css-values/#keywords}
 *
 * @public
 */
export class Keyword<T extends string = string>
  extends Value<"keyword", false>
  implements Resolvable<Keyword<T>, never>
{
  public static of<T extends string>(value: T): Keyword<T> {
    return new Keyword(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    super("keyword", false);
    this._value = value;
  }

  public get value(): T {
    return this._value;
  }

  public resolve(): Keyword<T> {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Keyword && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._value);
  }

  public toJSON(): Keyword.JSON<T> {
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
export namespace Keyword {
  export interface JSON<T extends string = string>
    extends Value.JSON<"keyword"> {
    value: T;
  }

  export function isKeyword(value: unknown): value is Keyword {
    return value instanceof Keyword;
  }

  /**
   * ToKeywords\<"a" | "b" | "c"\> === Keyword\<"a"\> | Keyword\<"b"\> | Keyword\<"c"\>
   */
  export type ToKeywords<Words extends string> = {
    [K in Words]: Keyword<K>;
  }[Words];

  export function parse<T extends string>(
    ...keywords: Array<T>
  ): CSSParser<ToKeywords<T>> {
    return map(
      Token.parseIdent((ident) =>
        keywords.some(equals(ident.value.toLowerCase())),
      ),
      (ident) =>
        // Make sure each possible keyword is separated into its own type. For
        // example, we want `parse("foo", "bar")` to result in the type
        // `Keyword<"foo"> | Keyword<"bar">`, not `Keyword<"foo" | "bar">`. Why?
        // Because the former is assignable to the latter, but the latter isn't
        // assignable to the former.
        Keyword.of(ident.value.toLowerCase()) as ToKeywords<T>,
    );
  }
}
