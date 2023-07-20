import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
  Token,
} from "../../syntax";

import { List } from "../collection";
import { Number } from "../numeric";

import { Function } from "./function";

const { map, right, pair, either, delimited, option, parseIf } = Parser;

/**
 * @public
 */
export class Scale extends Function<"scale"> {
  public static of(x: Number.Fixed, y: Number.Fixed): Scale {
    return new Scale(x, y);
  }

  private readonly _x: Number.Fixed;
  private readonly _y: Number.Fixed;

  private constructor(x: Number.Fixed, y: Number.Fixed) {
    super("scale", false);
    this._x = x;
    this._y = y;
  }

  public get kind(): "scale" {
    return "scale";
  }

  public get x(): Number.Fixed {
    return this._x;
  }

  public get y(): Number.Fixed {
    return this._y;
  }

  public resolve(): Scale {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Scale &&
      value._x.equals(this._x) &&
      value._y.equals(this._y)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y);
  }

  public toJSON(): Scale.JSON {
    return {
      ...super.toJSON(),
      x: this._x.toJSON(),
      y: this._y.toJSON(),
    };
  }

  public toString(): string {
    if (this._x.value === this._y.value) {
      return `scale(${this._x})`;
    }

    if (this._y.value === 1) {
      return `scaleX(${this._x})`;
    }

    if (this._x.value === 1) {
      return `scaleY(${this._y})`;
    }

    return `scale(${this._x}, ${this._y})`;
  }
}

/**
 * @public
 */
export namespace Scale {
  export interface JSON extends Function.JSON<"scale"> {
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
  }

  export function isScale(value: unknown): value is Scale {
    return value instanceof Scale;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scale}
   */
  const parseScale = map(
    CSSFunction.parse(
      "scale",
      parseIf(
        (values: ReadonlyArray<Number.Fixed>) =>
          values.length === 1 || values.length === 2,
        map(List.parseCommaSeparated(Number.parseBase), (list) => list.values),
        () => "scale() must have one or two coordinates"
      )
    ),
    ([_, [x, y]]) => Scale.of(x, y ?? x)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scalex}
   */
  const parseScaleX = map(
    CSSFunction.parse("scaleX", Number.parseBase),
    ([_, x]) => Scale.of(x, Number.of(1))
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scaley}
   */
  const parseScaleY = map(
    CSSFunction.parse("scaleY", Number.parseBase),
    ([_, y]) => Scale.of(Number.of(1), y)
  );

  export const parse: CSSParser<Scale> = either(
    parseScale,
    parseScaleX,
    parseScaleY
  );
}
