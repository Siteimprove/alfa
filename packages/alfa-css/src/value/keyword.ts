import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Slice } from "@siteimprove/alfa-slice";
import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

const { map } = Parser;
const { equals } = Predicate;

/**
 * @see https://drafts.csswg.org/css-values/#keywords
 */
export class Keyword<T extends string = string>
  implements Equatable, Serializable {
  public static of<T extends string>(value: T): Keyword<T> {
    return new Keyword(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
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

  public toString(): string {
    return this._value;
  }

  public toJSON(): Keyword.JSON {
    return {
      type: "keyword",
      value: this._value
    };
  }
}

export namespace Keyword {
  export interface JSON {
    [key: string]: json.JSON;
    type: "keyword";
    value: string;
  }

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
