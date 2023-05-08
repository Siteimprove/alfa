import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../syntax";
import { Value } from "./value";

const { map } = Parser;
const { equals } = Predicate;

/**
 * {@link https://drafts.csswg.org/css-values/#keywords}
 *
 * @public
 */
export class Keyword<T extends string = string> extends Value<"keyword"> {
  public static of<T extends string>(value: T): Keyword<T> {
    return new Keyword(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    super();
    this._value = value;
  }

  public get type(): "keyword" {
    return "keyword";
  }

  public get value(): T {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Keyword && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._value);
  }

  public toJSON(): Keyword.JSON<T> {
    return {
      type: "keyword",
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

  export function parse<T extends string>(
    ...keywords: Array<T>
  ): Parser<Slice<Token>, { [K in T]: Keyword<K> }[T], string> {
    return map(
      Token.parseIdent((ident) =>
        keywords.some(equals(ident.value.toLowerCase()))
      ),
      (ident) =>
        // Make sure each possible keyword is separated into its own type. For
        // example, we want `parse("foo", "bar")` to result in the type
        // `Keyword<"foo"> | Keyword<"bar">`, not `Keyword<"foo" | "bar">`. Why?
        // Because the former is assignable to the latter, but the latter isn't
        // assignable to the former.
        Keyword.of(ident.value.toLowerCase()) as { [K in T]: Keyword<K> }[T]
    );
  }
}
