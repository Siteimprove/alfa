import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser, Token } from "../../../syntax";

import { Color } from "../../color";
import { Length, Percentage } from "../../numeric";
import { Value } from "../../value";

const { either, pair, map, left, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#color-stop}
 */
export class Stop<
    C extends Color = Color,
    P extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed
    // CALC extends boolean = boolean
  >
  extends Value<"stop", false>
  implements Equatable, Hashable, Serializable
{
  public static of<
    C extends Color,
    P extends Length.Fixed | Percentage.Fixed
    // CALC extends boolean = boolean
  >(color: C, position: Option<P> = None): Stop<C, P> {
    return new Stop(color, position);
  }

  private readonly _color: C;
  private readonly _position: Option<P>;

  private constructor(color: C, position: Option<P>) {
    super("stop", false);
    this._color = color;
    this._position = position;
  }

  public get color(): C {
    return this._color;
  }

  public get position(): Option<P> {
    return this._position;
  }

  public resolve(): Stop.Canonical {
    // @ts-ignore
    return this;
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
  export type Canonical = Stop<
    Color.Canonical,
    Percentage.Canonical | Length.Canonical
  >;
  export interface JSON extends Value.JSON<"stop"> {
    color: Color.JSON;
    position: Length.Fixed.JSON | Percentage.Fixed.JSON | null;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-stop}
   */
  export const parse: CSSParser<Stop> = either(
    map(
      pair(
        left(Color.parse, Token.parseWhitespace),
        either(Length.parseBase, Percentage.parseBase)
      ),
      (result) => {
        const [color, position] = result;
        return Stop.of(color, Option.of(position));
      }
    ),
    map(
      pair(
        either(Length.parseBase, Percentage.parseBase),
        right(Token.parseWhitespace, Color.parse)
      ),
      (result) => {
        const [position, color] = result;
        return Stop.of(color, Option.of(position));
      }
    ),
    map(Color.parse, (color) => Stop.of(color))
  );
}
