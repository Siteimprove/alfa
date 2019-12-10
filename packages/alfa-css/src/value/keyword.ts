import { Equality } from "@siteimprove/alfa-equality";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../syntax/token";

const { map } = Parser;
const { equals } = Predicate;

/**
 * @see https://drafts.csswg.org/css-values/#keywords
 */
export class Keyword<T extends string = string>
  implements Equality<Keyword<T>> {
  public static of<T extends string>(value: T): Keyword<T> {
    return new Keyword(value);
  }

  public readonly value: T;

  private constructor(value: T) {
    this.value = value;
  }

  public equals(value: unknown): value is Keyword<T> {
    return value instanceof Keyword && value.value === this.value;
  }

  public toString(): string {
    return this.value;
  }
}

export namespace Keyword {
  export function isKeyword(value: unknown): value is Keyword {
    return value instanceof Keyword;
  }

  export function parse<T extends string>(
    ...keywords: Array<T>
  ): Parser<Slice<Token>, Keyword<T>, string> {
    return map(
      Token.parseIdent(ident => keywords.some(equals(ident.value))),
      ident => Keyword.of(ident.value as T)
    );
  }
}
