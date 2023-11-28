import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import { Parser as CSSParser, Token } from "../../../../syntax";

import { Keyword } from "../../../keyword";
import { Resolvable } from "../../../resolvable";
import { Value } from "../../../value";

const { map } = Parser;

/**
 * @internal
 */
export class Extent
  extends Value<"extent", false>
  implements Resolvable<Extent.Canonical, Extent.Resolver>
{
  public static of(
    shape: Extent.Shape = Extent.Shape.Circle,
    size: Extent.Size = Extent.Size.FarthestCorner,
  ): Extent {
    return new Extent(shape, size);
  }

  private readonly _shape: Extent.Shape;
  private readonly _size: Extent.Size;

  private constructor(shape: Extent.Shape, size: Extent.Size) {
    super("extent", false);
    this._shape = shape;
    this._size = size;
  }

  /** @public (knip) */
  public get shape(): Extent.Shape {
    return this._shape;
  }

  /** @public (knip) */
  public get size(): Extent.Size {
    return this._size;
  }

  public resolve(): Extent.Canonical {
    return this;
  }

  public equals(value: Extent): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Extent &&
      value._shape === this._shape &&
      value._size === this._size
    );
  }

  public hash(hash: Hash): void {
    hash.writeString(this._shape).writeString(this._size);
  }

  public toJSON(): Extent.JSON {
    return {
      ...super.toJSON(),
      shape: this._shape,
      size: this._size,
    };
  }

  public toString(): string {
    return `${this._shape} ${this._size}`;
  }
}

/**
 * @internal
 */
export namespace Extent {
  export enum Shape {
    Circle = "circle",
    Ellipse = "ellipse",
  }

  export enum Size {
    ClosestSide = "closest-side",
    FarthestSide = "farthest-side",
    ClosestCorner = "closest-corner",
    FarthestCorner = "farthest-corner",
  }

  export interface JSON extends Value.JSON<"extent"> {
    shape: `${Shape}`;
    size: `${Size}`;
  }

  export type Canonical = Extent;

  export type Resolver = {};

  const parseShape = map(
    Keyword.parse("circle", "ellipse"),
    (keyword) => keyword.value as Extent.Shape,
  );

  const parseSize = map(
    Keyword.parse(
      "closest-side",
      "farthest-side",
      "closest-corner",
      "farthest-corner",
    ),
    (keyword) => keyword.value as Size,
  );

  export const parse: CSSParser<Extent> = (input) => {
    let shape: Extent.Shape | undefined;
    let size: Extent.Size | undefined;

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

      if (size === undefined) {
        const result = parseSize(input);

        if (result.isOk()) {
          [input, size] = result.get();
          continue;
        }
      }

      break;
    }

    if (shape === undefined && size === undefined) {
      return Err.of(`Expected either an extent shape or size`);
    }

    return Result.of([input, Extent.of(shape, size)]);
  };
}
