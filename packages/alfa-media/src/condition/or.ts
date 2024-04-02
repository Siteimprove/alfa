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

export class Or
  implements Matchable, Iterable<Feature>, Equatable, Serializable<Or.JSON>
{
  public static of(left: Feature | Condition, right: Feature | Condition): Or {
    return new Or(left, right);
  }

  private readonly _left: Feature | Condition;
  private readonly _right: Feature | Condition;

  private constructor(left: Feature | Condition, right: Feature | Condition) {
    this._left = left;
    this._right = right;
  }

  public get left(): Feature | Condition {
    return this._left;
  }

  public get right(): Feature | Condition {
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

  private *iterator(): Iterator<Feature> {
    for (const condition of [this._left, this._right]) {
      yield* condition;
    }
  }

  public [Symbol.iterator](): Iterator<Feature> {
    return this.iterator();
  }

  public toJSON(): Or.JSON {
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
  export interface JSON {
    [key: string]: json.JSON;
    type: "or";
    left: Feature.JSON | Condition.JSON;
    right: Feature.JSON | Condition.JSON;
  }

  export function isOr(value: unknown): value is Or {
    return value instanceof Or;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-or}
   *
   * @internal
   */
  export function parse(
    parseInParens: Thunk<CSSParser<Feature | Condition>>,
  ): CSSParser<Feature | Condition> {
    return right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
      parseInParens(),
    );
  }
}
