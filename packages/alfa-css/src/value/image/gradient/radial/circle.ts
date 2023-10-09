import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Result } from "@siteimprove/alfa-result";
import { Parser as CSSParser, Token } from "../../../../syntax";
import { Keyword } from "../../../keyword";

import { Length } from "../../../numeric";

/**
 * {@link https://drafts.csswg.org/css-images/#valdef-ending-shape-circle}
 *
 * @internal
 */
export class Circle<R extends Length.Fixed = Length.Fixed>
  implements Equatable, Hashable, Serializable<Circle.JSON>
{
  public static of<R extends Length.Fixed>(radius: R): Circle<R> {
    return new Circle(radius);
  }

  private readonly _radius: R;

  private constructor(radius: R) {
    this._radius = radius;
  }

  public get type(): "circle" {
    return "circle";
  }

  public get radius(): R {
    return this._radius;
  }

  public equals(value: Circle): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Circle && value._radius.equals(this._radius);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._radius);
  }

  public toJSON(): Circle.JSON {
    return {
      type: "circle",
      radius: this._radius.toJSON(),
    };
  }

  public toString(): string {
    return `circle ${this._radius}`;
  }
}

/**
 * @internal
 */
export namespace Circle {
  export type Canonical = Circle<Length.Canonical>;
  export interface JSON {
    [key: string]: json.JSON;
    type: "circle";
    radius: Length.Fixed.JSON;
  }

  const parseShape = Keyword.parse("circle");

  const parseRadius = Length.parseBase;

  export const parse: CSSParser<Circle> = (input) => {
    let shape: Keyword<"circle"> | undefined;
    let radius: Length.Fixed | undefined;

    while (true) {
      for ([input] of Token.parseWhitespace(input)) {
      }

      if (shape === undefined) {
        const result = parseShape(input);

        if (result.isOk()) {
          [input, shape] = result.get();
          continue;
        }
      }

      if (radius === undefined) {
        const result = parseRadius(input);

        if (result.isOk()) {
          [input, radius] = result.get();
          continue;
        }
      }

      break;
    }

    if (radius === undefined) {
      return Err.of(`Expected circle radius`);
    }

    return Result.of([input, Circle.of(radius)]);
  };
}
