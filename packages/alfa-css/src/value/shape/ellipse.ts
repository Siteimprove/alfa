import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Function, Token } from "../../syntax";
import { Value } from "../../value";

import { Keyword } from "../keyword";
import { Position } from "../position";
import { Radius } from "./radius";

const { map, option, pair, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-shapes/#funcdef-ellipse}
 *
 * @public
 */
export class Ellipse<
  R extends Radius = Radius,
  P extends Position = Position
> extends Value<"basic-shape"> {
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

  public get type(): "basic-shape" {
    return "basic-shape";
  }

  public get kind(): "ellipse" {
    return "ellipse";
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
    hash
      .writeHashable(this._rx)
      .writeHashable(this._ry)
      .writeHashable(this._center);
  }

  public toJSON(): Ellipse.JSON {
    return {
      type: "basic-shape",
      kind: "ellipse",
      rx: this._rx.toJSON(),
      ry: this._ry.toJSON(),
      center: this._center.toJSON(),
    };
  }

  public toString(): string {
    return `ellipse(${this._rx} ${this._ry} at ${this._center})`;
  }
}

/**
 * @public
 */
export namespace Ellipse {
  export interface JSON extends Value.JSON<"basic-shape"> {
    kind: "ellipse";
    rx: Radius.JSON;
    ry: Radius.JSON;
    center: Position.JSON;
  }

  export function isEllipse(value: unknown): value is Ellipse {
    return value instanceof Ellipse;
  }

  export const parse: Parser<Slice<Token>, Ellipse, string> = map(
    Function.parse(
      "ellipse",
      pair(
        option(pair(Radius.parse, right(Token.parseWhitespace, Radius.parse))),
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
