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

export class Not
  implements Matchable, Iterable<Feature>, Equatable, Serializable<Not.JSON>
{
  public static of(condition: Feature | Condition): Not {
    return new Not(condition);
  }

  private readonly _condition: Feature | Condition;

  private constructor(condition: Feature | Condition) {
    this._condition = condition;
  }

  /** @public (knip) */
  public get condition(): Feature | Condition {
    return this._condition;
  }

  public matches(device: Device): boolean {
    return !this._condition.matches(device);
  }

  public equals(value: unknown): value is this {
    return value instanceof Not && value._condition.equals(this._condition);
  }

  private *iterator(): Iterator<Feature> {
    yield* this._condition;
  }

  /** @public (knip) */
  public [Symbol.iterator](): Iterator<Feature> {
    return this.iterator();
  }

  public toJSON(): Not.JSON {
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
  export interface JSON {
    [key: string]: json.JSON;
    type: "not";
    condition: Condition.JSON | Feature.JSON;
  }

  export function isNot(value: unknown): value is Not {
    return value instanceof Not;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-not}
   *
   * @internal
   */
  export function parse(
    parseInParens: Thunk<CSSParser<Feature | Condition>>,
  ): CSSParser<Not> {
    return map(
      right(
        delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
        parseInParens(),
      ),
      Not.of,
    );
  }
}
