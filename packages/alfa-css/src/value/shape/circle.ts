import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";
import { Value } from "../../value";

import { Keyword } from "../keyword";
import { Position } from "../position";
import { Radius } from "./radius";
import { Slice } from "@siteimprove/alfa-slice";

const { map, option, pair, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-shapes/#funcdef-circle}
 *
 * @public
 */
export class Circle<
  R extends Radius = Radius,
  P extends Position = Position
> extends Value<"basic-shape"> {
  public static of<R extends Radius, P extends Position>(
    radius: R,
    center: P
  ): Circle<R, P> {
    return new Circle(radius, center);
  }

  private readonly _radius: R;
  private readonly _center: P;

  private constructor(radius: R, center: P) {
    super();
    this._radius = radius;
    this._center = center;
  }

  public get type(): "basic-shape" {
    return "basic-shape";
  }

  public get kind(): "circle" {
    return "circle";
  }

  public get radius(): R {
    return this._radius;
  }

  public get center(): P {
    return this._center;
  }

  public equals(value: Circle): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Circle &&
      value._radius.equals(this._radius) &&
      value._center.equals(this._center)
    );
  }

  public hash(hash: Hash) {
    hash.writeHashable(this._radius).writeHashable(this._center);
  }

  public toJSON(): Circle.JSON {
    return {
      type: "basic-shape",
      kind: "circle",
      radius: this._radius.toJSON(),
      center: this._center.toJSON(),
    };
  }

  public toString(): string {
    return `circle(${this._radius.toString()} at ${this._center.toString()})`;
  }
}

/**
 * @public
 */
export namespace Circle {
  export interface JSON extends Value.JSON<"basic-shape"> {
    kind: "circle";
    radius: Radius.JSON;
    center: Position.JSON;
  }

  export function isCircle(value: unknown): value is Circle {
    return value instanceof Circle;
  }

  export const parse: Parser<Slice<Token>, Circle, string> = map(
    Function.parse(
      "circle",
      pair(
        option(Radius.parse),
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
    ([_, [radius, center]]) =>
      Circle.of(
        radius.getOr(Radius.of(Keyword.of("closest-side"))),
        center.getOr(Position.of(Keyword.of("center"), Keyword.of("center")))
      )
  );
}
