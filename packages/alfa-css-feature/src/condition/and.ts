import { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import type { Feature } from "../feature.js";

import type { Condition } from "./condition.js";

const { delimited, option, right } = Parser;

export class And<F extends Feature<F>> implements Feature<F, And.JSON<F>> {
  public static of<F extends Feature<F>>(
    left: Condition<F>,
    right: Condition<F>,
  ): And<F> {
    return new And(left, right);
  }

  private readonly _left: Condition<F>;
  private readonly _right: Condition<F>;

  private constructor(left: Condition<F>, right: Condition<F>) {
    this._left = left;
    this._right = right;
  }

  public get left(): Condition<F> {
    return this._left;
  }

  public get right(): Condition<F> {
    return this._right;
  }

  public matches(device: Device): boolean {
    return this._left.matches(device) && this._right.matches(device);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof And &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  private *iterator(): Iterator<F> {
    for (const condition of [this._left, this._right]) {
      yield* condition;
    }
  }

  public [Symbol.iterator](): Iterator<F> {
    return this.iterator();
  }

  public toJSON(): And.JSON<F> {
    return {
      type: "and",
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    return `(${this._left}) and (${this._right})`;
  }
}

export namespace And {
  export interface JSON<F extends Feature<F>> {
    [key: string]: json.JSON;
    type: "and";
    left: Condition.JSON<F>;
    right: Condition.JSON<F>;
  }

  export function isAnd<T extends Feature<T>>(value: unknown): value is And<T> {
    return value instanceof And;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-and}
   *
   * @internal
   */
  export function parse<F extends Feature<F>>(
    parseInParens: (featureParser: CSSParser<F>) => CSSParser<Condition<F>>,
    featureParser: CSSParser<F>,
  ): CSSParser<Condition<F>> {
    return right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
      parseInParens(featureParser),
    );
  }
}
