import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Position } from "../position";
import { Radius } from "./radius";
import { Value } from "../../value";
import { Function } from "../../syntax/function";
import { Keyword } from "../keyword";
import { Token } from "../../syntax/token";

const { map, pair } = Parser;

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-circle
 */
export class Circle<
  R extends Radius = Radius,
  P extends Position = Position
> extends Value<"shape"> {
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

  public get radius(): R {
    return this._radius;
  }

  public get center(): P {
    return this._center;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get kind(): "circle" {
    return "circle";
  }

  public equals(value: Circle): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Circle &&
      value.radius.equals(this.radius) &&
      value.center.equals(this.center)
    );
  }

  public hash(hash: Hash) {
    this.radius.hash(hash);
    this.center.hash(hash);
  }

  public toJSON(): Circle.JSON {
    return {
      type: "shape",
      kind: "circle",
      center: this.center.toJSON(),
      radius: this.radius.toJSON(),
    };
  }

  public toString(): string {
    return `circle(${this.radius.toString()} at ${this.center.toString()})`;
  }
}

export namespace Circle {
  import option = Parser.option;
  import right = Parser.right;
  import parseWhitespace = Token.parseWhitespace;

  export interface JSON extends Value.JSON {
    type: "shape";
    kind: "circle";
    center: Position.JSON;
    radius: Radius.JSON;
  }

  export function isCircle(value: unknown): value is Circle {
    return value instanceof Circle;
  }

  export const parse = map(
    Function.parse(
      "circle",
      pair(
        option(Radius.parse),
        option(
          right(
            option(parseWhitespace),
            right(Keyword.parse("at"), right(parseWhitespace, Position.parse()))
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
