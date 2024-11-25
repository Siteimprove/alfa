import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";
import type { PartiallyResolvable, Resolvable } from "../resolvable.js";

import { Value } from "../value.js";
import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import { Box } from "../box.js";
import { Keyword } from "../textual/keyword.js";

import { Circle } from "./circle.js";
import { Inset } from "./inset.js";
import { Rectangle } from "./rectangle.js";
import { Ellipse } from "./ellipse.js";
import { Polygon } from "./polygon.js";

const { either } = Parser;

/**
 * @public
 */
export class Shape<
    S extends Shape.Basic = Shape.Basic,
    B extends Box.Geometry = Box.Geometry,
  >
  extends Value<"shape", Value.HasCalculation<[S]>>
  implements
    Resolvable<Shape.Canonical, Shape.Resolver>,
    PartiallyResolvable<Shape.PartiallyResolved, Shape.PartialResolver>
{
  public static of<
    S extends Shape.Basic = Shape.Basic,
    B extends Box.Geometry = Box.Geometry,
  >(shape: S, box: B): Shape<S, B> {
    return new Shape(shape, box);
  }

  private readonly _shape: S;
  private readonly _box: B;

  private constructor(shape: S, box: B) {
    super("shape", Value.hasCalculation(shape));
    this._shape = shape;
    this._box = box;
  }

  public get shape(): S {
    return this._shape;
  }

  public get box(): B {
    return this._box;
  }

  public resolve(resolver: Shape.Resolver): Shape.Canonical {
    return new Shape(this._shape.resolve(resolver), this._box);
  }

  public partiallyResolve(
    resolver: Shape.PartialResolver,
  ): Shape.PartiallyResolved {
    return Shape.of(
      Shape.Basic.partiallyResolve(resolver)(this._shape),
      this._box,
    );
  }

  public equals(value: Shape): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Shape &&
      value._shape.equals(this._shape) &&
      value._box.equals(this._box)
    );
  }

  public hash(hash: Hash) {
    hash.writeHashable(this._shape).writeHashable(this._box);
  }

  public toJSON(): Shape.JSON {
    return {
      ...super.toJSON(),
      shape: this._shape.toJSON(),
      box: this._box.toJSON(),
    };
  }

  public toString(): string {
    return `${this._shape.toString()} ${this._box.toString()}`;
  }
}

/**
 * @public
 */
export namespace Shape {
  export type Canonical = Shape<Basic.Canonical, Box.Geometry>;

  /**
   * {@link https://drafts.csswg.org/css-shapes/#typedef-basic-shape}
   */
  export type Basic = Circle | Ellipse | Inset | Polygon | Rectangle;

  export namespace Basic {
    export type Canonical =
      | Circle.Canonical
      | Ellipse.Canonical
      | Inset.Canonical
      | Polygon.Canonical
      | Rectangle.Canonical;

    export type JSON =
      | Circle.JSON
      | Ellipse.JSON
      | Inset.JSON
      | Polygon.JSON
      | Rectangle.JSON;

    export type Resolver = Circle.Resolver &
      Ellipse.Resolver &
      Inset.Resolver &
      Polygon.Resolver &
      Rectangle.Resolver;

    export type PartiallyResolved =
      | Circle.PartiallyResolved
      | Ellipse.PartiallyResolved
      | Inset.PartiallyResolved
      | Polygon.PartiallyResolved
      | Rectangle.Canonical;

    export type PartialResolver = Circle.PartialResolver &
      Ellipse.PartialResolver &
      Inset.PartialResolver &
      Polygon.PartialResolver &
      Rectangle.Resolver;

    export function partiallyResolve(
      resolver: PartialResolver,
    ): (value: Basic) => PartiallyResolved {
      return (value) =>
        Selective.of(value)
          .if(Rectangle.isRectangle, (rectangle) => rectangle.resolve(resolver))
          .else((value) => value.partiallyResolve(resolver))
          .get();
    }

    /**
     * @remarks
     * This does not parse the deprecated `rect()` shape.
     *
     * @internal
     */
    export const parse = either<
      Slice<Token>,
      Circle | Ellipse | Inset | Polygon,
      string
    >(Circle.parse, Ellipse.parse, Inset.parse, Polygon.parse);
  }

  export interface JSON extends Value.JSON<"shape"> {
    shape: Basic.JSON;
    box: Box.Geometry.JSON;
  }

  export type Resolver = Basic.Resolver;

  export type PartiallyResolved = Shape<Basic.PartiallyResolved, Box.Geometry>;

  export type PartialResolver = Basic.PartialResolver;

  /**
   * @remarks
   * This does not parse the deprecated `rect()` shape.
   */
  export const parse: CSSParser<Shape<Circle | Ellipse | Inset | Polygon>> = (
    input,
  ) => {
    let shape: Circle | Ellipse | Inset | Polygon | undefined;
    let box: Box.Geometry | undefined;

    const skipWhitespace = () => {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }
    };

    while (true) {
      skipWhitespace();

      if (shape === undefined) {
        const result = Basic.parse(input);

        if (result.isOk()) {
          [input, shape] = result.get();
          continue;
        }
      }

      if (box === undefined) {
        const result = Box.parseGeometry(input);

        if (result.isOk()) {
          [input, box] = result.get();
          continue;
        }
      }

      break;
    }

    // Even though `<geometry-box>` alone is accepted by the specs, it seems to
    // have no browser support.
    if (shape === undefined) {
      return Err.of("Expected a shape");
    }

    return Result.of([input, Shape.of(shape, box ?? Keyword.of("border-box"))]);
  };
}
