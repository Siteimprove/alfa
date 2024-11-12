import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { String } from "@siteimprove/alfa-string";

import { type Parser as CSSParser, Token } from "../syntax/index.js";

import type { Resolvable } from "./resolvable.js";
import { Ident } from "./ident.js";

const { map } = Parser;
const { equals } = Predicate;

/**
 * {@link https://drafts.csswg.org/css-values/#keywords}
 *
 * @public
 */
export class Keyword<T extends Lowercase<string> = Lowercase<string>>
  extends Ident<"keyword", T>
  implements Resolvable<Keyword<T>, never>
{
  public static of<T extends Lowercase<string>>(value: T): Keyword<T> {
    return new Keyword(value);
  }

  private constructor(value: T) {
    super("keyword", value);
  }

  public equals(value: unknown): value is this {
    return value instanceof Keyword && super.equals(value);
  }

  public toJSON(): Keyword.JSON<T> {
    return {
      ...super.toJSON(),
    };
  }
}

/**
 * @public
 */
export namespace Keyword {
  export interface JSON<T extends string = string>
    extends Ident.JSON<"keyword", T> {}

  export function isKeyword(value: unknown): value is Keyword {
    return value instanceof Keyword;
  }

  /**
   * ToKeywords\<"a" | "b" | "c"\> === Keyword\<"a"\> | Keyword\<"b"\> | Keyword\<"c"\>
   */
  export type ToKeywords<Words extends Lowercase<string>> = {
    [K in Words]: Keyword<K>;
  }[Words];

  export function parse<T extends string>(
    ...keywords: Array<T>
  ): CSSParser<ToKeywords<Lowercase<T>>> {
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
        Keyword.of(String.toLowerCase(ident.value)) as ToKeywords<Lowercase<T>>,
    );
  }
}
