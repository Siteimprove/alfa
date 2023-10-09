import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Result } from "@siteimprove/alfa-result";

import { Parser as CSSParser, Token } from "../../../../syntax";

import { Keyword } from "../../../keyword";
import { Length } from "../../../numeric";
import { Resolvable } from "../../../resolvable";
import { Value } from "../../../value";

/**
 * {@link https://drafts.csswg.org/css-images/#valdef-ending-shape-circle}
 *
 * @internal
 */
export class Circle<R extends Length = Length>
  extends Value<"circle", Value.HasCalculation<[R]>>
  implements Equatable, Hashable, Serializable<Circle.JSON>
{
  public static of<R extends Length>(radius: R): Circle<R> {
    return new Circle(radius);
  }

  private readonly _radius: R;

  private constructor(radius: R) {
    super("circle", Value.hasCalculation(radius));
    this._radius = radius;
  }

  public get radius(): R {
    return this._radius;
  }

  public resolve(resolver: Circle.Resolver): Circle.Canonical {
    return new Circle(this._radius.resolve(resolver));
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
      ...super.toJSON(),
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
  export interface JSON extends Value.JSON<"circle"> {
    radius: Length.JSON;
  }

  export type Resolver = Length.Resolver;

  export function isCircle(value: unknown): value is Circle {
    return value instanceof Circle;
  }

  const parseShape = Keyword.parse("circle");

  const parseRadius = Length.parse;

  export const parse: CSSParser<Circle> = (input) => {
    let shape: Keyword<"circle"> | undefined;
    let radius: Length | undefined;

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