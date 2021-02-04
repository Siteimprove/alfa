import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Box } from "./box";
import { Keyword } from "./keyword";
import { Value } from "../value";

import {
  Circle,
  Ellipse,
  Inset,
  Polygon,
  Rectangle,
} from "./shape/basic-shape";
import { Token } from "../syntax/token";

const { either } = Parser;

export class Shape<
  S extends Shape.Basic = Shape.Basic,
  B extends Box.GeometryBox = Box.GeometryBox
> extends Value<"shape"> {
  public static of<
    S extends Shape.Basic = Shape.Basic,
    B extends Box.GeometryBox = Box.GeometryBox
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
    this._shape.hash(hash);
    this._box.hash(hash);
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

export namespace Shape {
  /**
   * @see https://drafts.csswg.org/css-shapes/#supported-basic-shapes
   *
   * Rectangle is technically not a <basic-shape>, and is deprecated, but is essentially serving the same purposes.
   */
  export type Basic = Circle | Ellipse | Inset | Polygon | Rectangle;

  export interface JSON extends Value.JSON<"shape"> {
    shape:
      | Circle.JSON
      | Ellipse.JSON
      | Inset.JSON
      | Polygon.JSON
      | Rectangle.JSON;
    box: Keyword.JSON<Box.GeometryBoxName>;
  }

  /**
   * Parsing the <basic-shape> || <geometry-box> bit of the syntax.
   * Thus Rectangle is left out.
   */
  export const parse: Parser<
    Slice<Token>,
    Shape<Circle | Ellipse | Inset | Polygon>,
    string
  > = (input) => {
    let basicShape: Circle | Ellipse | Inset | Polygon | undefined;
    let geometryBox: Box.GeometryBox | undefined;

    const skipWhitespace = () => {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }
    };

    while (true) {
      skipWhitespace();

      if (basicShape === undefined) {
        const result = either<
          Slice<Token>,
          Circle | Ellipse | Inset | Polygon,
          string
        >(
          Circle.parse,
          Ellipse.parse,
          Inset.parse,
          Polygon.parse
        )(input);

        if (result.isOk()) {
          [input, basicShape] = result.get();

          continue;
        }
      }

      if (geometryBox === undefined) {
        const result = Keyword.parse(...Box.geometryBox)(input);

        if (result.isOk()) {
          [input, geometryBox] = result.get();

          continue;
        }
      }

      break;
    }

    // Even though <geometry-box> alone is accepted by the specs, it seems to have no browser support.
    if (basicShape === undefined) {
      return Err.of("Expected a shape");
    }

    return Result.of([
      input,
      Shape.of(basicShape, geometryBox ?? Keyword.of("border-box")),
    ]);
  };
}
