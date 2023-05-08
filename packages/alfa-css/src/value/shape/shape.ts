import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Value } from "../../value";
import { Token } from "../../syntax";

import { Box } from "../box";
import { Keyword } from "../keyword";
import { Circle } from "./circle";
import { Inset } from "./inset";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Polygon } from "./polygon";

const { either } = Parser;

/**
 * @public
 */
export class Shape<
  S extends Shape.Basic = Shape.Basic,
  B extends Box.Geometry = Box.Geometry
> extends Value<"shape"> {
  public static of<
    S extends Shape.Basic = Shape.Basic,
    B extends Box.Geometry = Box.Geometry
  >(shape: S, box: B): Shape<S, B> {
    return new Shape(shape, box);
  }

  private readonly _shape: S;
  private readonly _box: B;

  private constructor(shape: S, box: B) {
    super();
    this._shape = shape;
    this._box = box;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get shape(): S {
    return this._shape;
  }

  public get box(): B {
    return this._box;
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
      type: "shape",
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
  /**
   * {@link https://drafts.csswg.org/css-shapes/#typedef-basic-shape}
   */
  export type Basic = Circle | Ellipse | Inset | Polygon | Rectangle;

  export interface JSON extends Value.JSON<"shape"> {
    shape:
      | Circle.JSON
      | Ellipse.JSON
      | Inset.JSON
      | Polygon.JSON
      | Rectangle.JSON;
    box: Box.Geometry.JSON;
  }

  /**
   * @remarks
   * This does not parse the deprecated `rect()` shape.
   */
  const parseBasicShape = either<
    Slice<Token>,
    Circle | Ellipse | Inset | Polygon,
    string
  >(Circle.parse, Ellipse.parse, Inset.parse, Polygon.parse);

  /**
   * @remarks
   * This does not parse the deprecated `rect()` shape.
   */
  export const parse: Parser<
    Slice<Token>,
    Shape<Circle | Ellipse | Inset | Polygon>,
    string
  > = (input) => {
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
        const result = parseBasicShape(input);

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
