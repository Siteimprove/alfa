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

const { delimited, option, right } = Parser;

export class Or<T extends Feature<T>>
  implements Matchable, Iterable<T>, Equatable, Serializable<Or.JSON<T>>
{
  public static of<T extends Feature<T>>(
    left: Condition<T>,
    right: Condition<T>,
  ): Or<T> {
    return new Or(left, right);
  }

  private readonly _left: Condition<T>;
  private readonly _right: Condition<T>;

  private constructor(left: Condition<T>, right: Condition<T>) {
    this._left = left;
    this._right = right;
  }

  /** @public (knip) */
  public get left(): Condition<T> {
    return this._left;
  }

  /** @public (knip) */
  public get right(): Condition<T> {
    return this._right;
  }

  public matches(device: Device): boolean {
    return this._left.matches(device) || this._right.matches(device);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Or &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  private *iterator(): Iterator<T> {
    for (const condition of [this._left, this._right]) {
      yield* condition;
    }
  }

  /** @public (knip) */
  public [Symbol.iterator](): Iterator<T> {
    return this.iterator();
  }

  public toJSON(): Or.JSON<T> {
    return {
      type: "or",
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    return `(${this._left}) or (${this._right})`;
  }
}

export namespace Or {
  export interface JSON<T extends Feature<T>> {
    [key: string]: json.JSON;
    type: "or";
    left: Condition.JSON<T>;
    right: Condition.JSON<T>;
  }

  export function isOr<T extends Feature<T>>(value: unknown): value is Or<T> {
    return value instanceof Or;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-or}
   *
   * @internal
   */
  export function parse<T extends Feature<T>>(
    parseInParens: Thunk<CSSParser<Condition<T>>>,
  ): CSSParser<Condition<T>> {
    return right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
      parseInParens(),
    );
  }
}
