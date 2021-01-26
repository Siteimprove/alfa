import { Value } from "../../value";
import { Radius } from "./radius";
import { Position } from "../position";
import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";
import { Keyword } from "../keyword";
import { Circle } from "./circle";

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-ellipse
 */
export class Ellipse<
  R extends Radius = Radius,
  P extends Position = Position
> extends Value<"shape"> {
  public static of<R extends Radius = Radius, P extends Position = Position>(
    rx: R,
    ry: R,
    center: P
  ): Ellipse<R, P> {
    return new Ellipse(rx, ry, center);
  }

  private readonly _rx: R;
  private readonly _ry: R;
  private readonly _center: P;

  private constructor(rx: R, ry: R, center: P) {
    super();
    this._rx = rx;
    this._ry = ry;
    this._center = center;
  }

  public get rx(): R {
    return this._rx;
  }

  public get ry(): R {
    return this._ry;
  }

  public get center(): P {
    return this._center;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get kind(): "ellipse" {
    return "ellipse";
  }

  public equals(value: Ellipse): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Ellipse &&
      value._rx.equals(this._rx) &&
      value._ry.equals(this._ry) &&
      value._center.equals(this._center)
    );
  }

  public hash(hash: Hash) {
    this._rx.hash(hash);
    this._ry.hash(hash);
    this._center.hash(hash);
  }

  public toJSON(): Ellipse.JSON {
    return {
      type: "shape",
      kind: "ellipse",
      center: this.center.toJSON(),
      rx: this.rx.toJSON(),
      ry: this.ry.toJSON(),
    };
  }

  public toString(): string {
    return `ellipse(${this.rx} ${this.ry} at ${this.center})`;
  }
}

export namespace Ellipse {
  import map = Parser.map;
  import pair = Parser.pair;
  import right = Parser.right;
  import option = Parser.option;

  export interface JSON extends Value.JSON<"shape"> {
    kind: "ellipse";
    center: Position.JSON;
    rx: Radius.JSON;
    ry: Radius.JSON;
  }

  export function isEllipse(value: unknown): value is Ellipse {
    return value instanceof Ellipse;
  }

  export const parse = map(
    Function.parse(
      "circle",
      pair(
        option(pair(Radius.parse, Radius.parse)),
        option(
          right(
            option(Token.parseWhitespace),
            right(
              Keyword.parse("at"),
              right(Token.parseWhitespace, Position.parse())
            )
          )
        )
      )
    ),
    ([_, [radii, center]]) => {
      const [rx, ry] = radii.getOr([
        Radius.of(Keyword.of("closest-side")),
        Radius.of(Keyword.of("closest-side")),
      ]);

      return Ellipse.of(
        rx,
        ry,
        center.getOr(Position.of(Keyword.of("center"), Keyword.of("center")))
      );
    }
  );
}
