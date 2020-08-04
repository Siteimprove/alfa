import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";
import { Value } from "../value";

const { map } = Parser;
const { equals } = Predicate;

/**
 * @see https://drafts.csswg.org/css-values/#keywords
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
    Hash.writeString(hash, this._value);
  }

  public toJSON(): Keyword.JSON {
    return {
      type: "keyword",
      value: this._value,
    };
  }

  public toString(): string {
    return this._value;
  }
}

export namespace Keyword {
  export interface JSON extends Value.JSON {
    type: "keyword";
    value: string;
  }

  export function isKeyword(value: unknown): value is Keyword {
    return value instanceof Keyword;
  }

  export function parse<T extends string>(...keywords: Array<T>) {
    return map(
      Token.parseIdent((ident) =>
        keywords.some(equals(ident.value.toLowerCase()))
      ),
      (ident) => Keyword.of(ident.value.toLowerCase() as T)
    );
  }
}
