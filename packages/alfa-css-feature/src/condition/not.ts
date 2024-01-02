import { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import type { Feature } from "../feature";
import type { Matchable } from "../matchable";

import type { Condition } from "./condition";

const { delimited, map, option, right } = Parser;

export class Not<T extends Feature<T>>
  implements Matchable, Iterable<T>, Equatable, Serializable<Not.JSON<T>>
{
  public static of<T extends Feature<T>>(condition: Condition<T>): Not<T> {
    return new Not(condition);
  }

  private readonly _condition: Condition<T>;

  private constructor(condition: Condition<T>) {
    this._condition = condition;
  }

  /** @public (knip) */
  public get condition(): Condition<T> {
    return this._condition;
  }

  public matches(device: Device): boolean {
    return !this._condition.matches(device);
  }

  public equals(value: unknown): value is this {
    return value instanceof Not && value._condition.equals(this._condition);
  }

  private *iterator(): Iterator<T> {
    yield* this._condition;
  }

  /** @public (knip) */
  public [Symbol.iterator](): Iterator<T> {
    return this.iterator();
  }

  public toJSON(): Not.JSON<T> {
    return {
      type: "not",
      condition: this._condition.toJSON(),
    };
  }

  public toString(): string {
    return `not (${this._condition})`;
  }
}

export namespace Not {
  export interface JSON<T extends Feature<T>> {
    [key: string]: json.JSON;
    type: "not";
    condition: Condition.JSON<T>;
  }

  export function isNot<T extends Feature<T>>(value: unknown): value is Not<T> {
    return value instanceof Not;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-not}
   *
   * @internal
   */
  export function parse<T extends Feature<T>>(
    parseInParens: Thunk<CSSParser<Condition<T>>>,
  ): CSSParser<Not<T>> {
    return map(
      right(
        delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
        parseInParens(),
      ),
      Not.of,
    );
  }
}
