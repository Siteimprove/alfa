import { Hash } from "@siteimprove/alfa-hash";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser, Token } from "../../../../syntax";

import { Color } from "../../../color";
import { LengthPercentage } from "../../../numeric";
import { Value } from "../../../value";

const { either, pair, map, left, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#color-stop}
 */
export class Stop<
  C extends Color = Color,
  P extends LengthPercentage = LengthPercentage
> extends Value<"stop", Value.HasCalculation<[C, P]>> {
  public static of<C extends Color, P extends LengthPercentage>(
    color: C,
    position: Option<P> = None
  ): Stop<C, P> {
    return new Stop(color, position);
  }

  private readonly _color: C;
  private readonly _position: Option<P>;

  private constructor(color: C, position: Option<P>) {
    super(
      "stop",
      (Value.hasCalculation(color) ||
        position
          .map(Value.hasCalculation)
          .getOr(false)) as Value.HasCalculation<[C, P]>
    );
    this._color = color;
    this._position = position;
  }

  public get color(): C {
    return this._color;
  }

  public get position(): Option<P> {
    return this._position;
  }

  public resolve(resolver: Stop.Resolver): Stop.Canonical {
    return new Stop(
      this._color.resolve(),
      this._position.map(LengthPercentage.resolve(resolver))
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Stop &&
      value._color.equals(this._color) &&
      value._position.equals(this._position)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._color).writeHashable(this._position);
  }

  public toJSON(): Stop.JSON {
    return {
      ...super.toJSON(),
      color: this._color.toJSON(),
      position: this._position.map((position) => position.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    return `${this._color}${this._position
      .map((position) => ` ${position}`)
      .getOr("")}`;
  }
}

export namespace Stop {
  export type Canonical = Stop<Color.Canonical, LengthPercentage.Canonical>;

  export type PartiallyResolved = Stop<
    Color.Canonical,
    LengthPercentage.PartiallyResolved
  >;

  export interface JSON extends Value.JSON<"stop"> {
    color: Color.JSON;
    position: LengthPercentage.JSON | null;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartialResolver = LengthPercentage.PartialResolver;

  export function partiallyResolve(
    resolver: PartialResolver
  ): (value: Stop) => PartiallyResolved {
    return (value) =>
      Stop.of(
        value.color.resolve(),
        value.position.map(LengthPercentage.partiallyResolve(resolver))
      );
  }

  export function isStop(value: unknown): value is Stop {
    return value instanceof Stop;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-stop}
   */
  export const parse: CSSParser<Stop> = either(
    map(
      pair(left(Color.parse, Token.parseWhitespace), LengthPercentage.parse),
      (result) => {
        const [color, position] = result;
        return Stop.of(color, Option.of(position));
      }
    ),
    map(
      pair(LengthPercentage.parse, right(Token.parseWhitespace, Color.parse)),
      (result) => {
        const [position, color] = result;
        return Stop.of(color, Option.of(position));
      }
    ),
    map(Color.parse, (color) => Stop.of(color))
  );
}
