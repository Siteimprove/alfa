import { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import type { Feature } from "../feature.js";

import type { Condition } from "./condition.js";

const { delimited, map, option, right } = Parser;

export class Not<F extends Feature<F>> implements Feature<F, Not.JSON<F>> {
  public static of<F extends Feature<F>>(condition: Condition<F>): Not<F> {
    return new Not(condition);
  }

  private readonly _condition: Condition<F>;

  private constructor(condition: Condition<F>) {
    this._condition = condition;
  }

  public get condition(): Condition<F> {
    return this._condition;
  }

  public matches(device: Device): boolean {
    return !this._condition.matches(device);
  }

  public equals(value: unknown): value is this {
    return value instanceof Not && value._condition.equals(this._condition);
  }

  private *iterator(): Iterator<F> {
    yield* this._condition;
  }

  public [Symbol.iterator](): Iterator<F> {
    return this.iterator();
  }

  public toJSON(): Not.JSON<F> {
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
  export interface JSON<F extends Feature<F>> {
    [key: string]: json.JSON;
    type: "not";
    condition: Condition.JSON<F>;
  }

  export function isNot<T extends Feature<T>>(value: unknown): value is Not<T> {
    return value instanceof Not;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-not}
   *
   * @internal
   */
  export function parse<F extends Feature<F>>(
    parseInParens: (featureParser: CSSParser<F>) => CSSParser<Condition<F>>,
    featureParser: CSSParser<F>,
  ): CSSParser<Not<F>> {
    return map(
      right(
        delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
        parseInParens(featureParser),
      ),
      Not.of,
    );
  }
}
