import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser, Token } from "../../syntax";

import { Keyword } from "../keyword";
import { Position } from "../position";
import { PartiallyResolvable, Resolvable } from "../resolvable";
import { Value } from "../value";

import { BasicShape } from "./basic-shape";
import { Radius } from "./radius";

const { map, option, pair, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-shapes/#funcdef-circle}
 *
 * @public
 */
export class Circle<R extends Radius = Radius, P extends Position = Position>
  extends BasicShape<"circle", Value.HasCalculation<[R, P]>>
  implements
    Resolvable<Circle.Canonical, Circle.Resolver>,
    PartiallyResolvable<Circle.PartiallyResolved, Circle.PartialResolver>
{
  public static of<R extends Radius, P extends Position>(
    radius: R,
    center: P,
  ): Circle<R, P> {
    return new Circle(radius, center);
  }

  private readonly _radius: R;
  private readonly _center: P;

  private constructor(radius: R, center: P) {
    super("circle", Value.hasCalculation(radius, center));
    this._radius = radius;
    this._center = center;
  }

  public get radius(): R {
    return this._radius;
  }

  public get center(): P {
    return this._center;
  }

  public resolve(resolver: Circle.Resolver): Circle.Canonical {
    return new Circle(
      this._radius.resolve(resolver),
      this._center.resolve(resolver),
    );
  }

  public partiallyResolve(
    resolver: Circle.PartialResolver,
  ): Circle.PartiallyResolved {
    return new Circle(
      this._radius.partiallyResolve(resolver),
      this._center.partiallyResolve(resolver),
    );
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
      ...super.toJSON(),
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
  export type Canonical = Circle<Radius.Canonical, Position.Canonical>;

  export type PartiallyResolved = Circle<
    Radius.PartiallyResolved,
    Position.PartiallyResolved
  >;

  export interface JSON extends BasicShape.JSON<"circle"> {
    radius: Radius.JSON;
    center: Position.JSON;
  }

  export type Resolver = Radius.Resolver & Position.Resolver;

  export type PartialResolver = Radius.PartialResolver &
    Position.PartialResolver;

  export function isCircle(value: unknown): value is Circle {
    return value instanceof Circle;
  }

  export const parse: CSSParser<Circle> = map(
    Function.parse(
      "circle",
      pair(
        option(Radius.parse),
        option(
          right(
            option(Token.parseWhitespace),
            right(
              Keyword.parse("at"),
              right(Token.parseWhitespace, Position.parse()),
            ),
          ),
        ),
      ),
    ),
    ([_, [radius, center]]) =>
      Circle.of(
        radius.getOr(Radius.of(Keyword.of("closest-side"))),
        center.getOr(Position.of(Keyword.of("center"), Keyword.of("center"))),
      ),
  );
}
