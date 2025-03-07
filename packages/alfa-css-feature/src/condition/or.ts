import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { Parser } from "@siteimprove/alfa-parser";

import type * as json from "@siteimprove/alfa-json";

import type { Feature } from "../feature.js";

import type { Condition } from "./condition.js";

const { delimited, option, right } = Parser;

export class Or<F extends Feature<F>> implements Feature<F, Or.JSON<F>> {
  public static of<F extends Feature<F>>(
    left: Condition<F>,
    right: Condition<F>,
  ): Or<F> {
    return new Or(left, right);
  }

  private readonly _left: Condition<F>;
  private readonly _right: Condition<F>;

  protected constructor(left: Condition<F>, right: Condition<F>) {
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
    return this._left.matches(device) || this._right.matches(device);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Or &&
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

  public toJSON(): Or.JSON<F> {
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
  export interface JSON<F extends Feature<F>> {
    [key: string]: json.JSON;
    type: "or";
    left: Condition.JSON<F>;
    right: Condition.JSON<F>;
  }

  export function isOr<T extends Feature<T>>(value: unknown): value is Or<T> {
    return value instanceof Or;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-or}
   *
   * @internal
   */
  export function parse<F extends Feature<F>>(
    parseInParens: (featureParser: CSSParser<F>) => CSSParser<Condition<F>>,
    featureParser: CSSParser<F>,
  ): CSSParser<Condition<F>> {
    return right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
      parseInParens(featureParser),
    );
  }
}
