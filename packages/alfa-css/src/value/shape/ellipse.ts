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
 * {@link https://drafts.csswg.org/css-shapes/#funcdef-ellipse}
 *
 * @public
 */
export class Ellipse<R extends Radius = Radius, P extends Position = Position>
  extends BasicShape<"ellipse", Value.HasCalculation<[R, P]>>
  implements
    Resolvable<Ellipse.Canonical, Ellipse.Resolver>,
    PartiallyResolvable<Ellipse.PartiallyResolved, Ellipse.PartialResolver>
{
  public static of<R extends Radius = Radius, P extends Position = Position>(
    rx: R,
    ry: R,
    center: P,
  ): Ellipse<R, P> {
    return new Ellipse(rx, ry, center);
  }

  private readonly _rx: R;
  private readonly _ry: R;
  private readonly _center: P;

  private constructor(rx: R, ry: R, center: P) {
    super(
      "ellipse",
      // TS sees the first as Value.HasCalculation<[R, R, P]>
      Value.hasCalculation(rx, ry, center) as unknown as Value.HasCalculation<
        [R, P]
      >,
    );
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

  public resolve(resolver: Ellipse.Resolver): Ellipse.Canonical {
    return new Ellipse(
      this._rx.resolve(resolver),
      this._ry.resolve(resolver),
      this._center.resolve(resolver),
    );
  }

  public partiallyResolve(
    resolver: Ellipse.PartialResolver,
  ): Ellipse.PartiallyResolved {
    return new Ellipse(
      this._rx.partiallyResolve(resolver),
      this._ry.partiallyResolve(resolver),
      this._center.partiallyResolve(resolver),
    );
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
      ...super.toJSON(),
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
  export type Canonical = Ellipse<Radius.Canonical, Position.Canonical>;

  export type PartiallyResolved = Ellipse<
    Radius.PartiallyResolved,
    Position.PartiallyResolved
  >;

  export interface JSON extends BasicShape.JSON<"ellipse"> {
    rx: Radius.JSON;
    ry: Radius.JSON;
    center: Position.JSON;
  }

  export type Resolver = Radius.Resolver & Position.Resolver;

  export type PartialResolver = Radius.PartialResolver &
    Position.PartialResolver;

  export function isEllipse(value: unknown): value is Ellipse {
    return value instanceof Ellipse;
  }

  export const parse: CSSParser<Ellipse> = map(
    Function.parse(
      "ellipse",
      pair(
        option(pair(Radius.parse, right(Token.parseWhitespace, Radius.parse))),
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
    ([_, [radii, center]]) => {
      const [rx, ry] = radii.getOr([
        Radius.of(Keyword.of("closest-side")),
        Radius.of(Keyword.of("closest-side")),
      ]);

      return Ellipse.of(
        rx,
        ry,
        center.getOr(Position.of(Keyword.of("center"), Keyword.of("center"))),
      );
    },
  );
}
