import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { type Parser as CSSParser, Token } from "../../syntax";

import { Color } from "../color";
import { Length, Percentage } from "../numeric";
import { Value } from "../value";

import { Linear } from "./gradient-linear";
import { Radial } from "./gradient-radial";

const { either, pair, map, option, oneOrMore, delimited, left, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#gradients}
 *
 * @public
 */
export type Gradient = Linear | Radial;

/**
 * @public
 */
export namespace Gradient {
  export type Canonical = Linear.Canonical | Radial.Canonical;

  export type JSON = Linear.JSON | Radial.JSON;

  /**
   * {@link https://drafts.csswg.org/css-images/#color-stop}
   */
  export class Stop<
      C extends Color = Color,
      P extends Length.Fixed | Percentage.Fixed =
        | Length.Fixed
        | Percentage.Fixed
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
        position: this._position
          .map((position) => position.toJSON())
          .getOr(null),
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

  /**
   * {@link https://drafts.csswg.org/css-images/#color-transition-hint}
   */
  export class Hint<
    P extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed
  > implements Equatable, Hashable, Serializable
  {
    public static of<P extends Length.Fixed | Percentage.Fixed>(
      position: P
    ): Hint<P> {
      return new Hint(position);
    }

    private readonly _position: P;

    private constructor(position: P) {
      this._position = position;
    }

    public get type(): "hint" {
      return "hint";
    }

    public get position(): P {
      return this._position;
    }

    public equals(value: unknown): value is this {
      return value instanceof Hint && value._position.equals(this._position);
    }

    public hash(hash: Hash): void {
      hash.writeHashable(this._position);
    }

    public toJSON(): Hint.JSON {
      return {
        type: "hint",
        position: this._position.toJSON(),
      };
    }

    public toString(): string {
      return `${this._position}`;
    }
  }

  export namespace Hint {
    export type Canonical = Hint<Percentage.Canonical | Length.Canonical>;

    export interface JSON {
      [key: string]: json.JSON;
      type: "hint";
      position: Length.Fixed.JSON | Percentage.Fixed.JSON;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-hint}
   */
  export const parseHint: CSSParser<Hint> = map(
    either(Length.parseBase, Percentage.parseBase),
    (position) => Hint.of(position)
  );

  export type Item = Stop | Hint;

  export namespace Item {
    export type JSON = Stop.JSON | Hint.JSON;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-color-stop-list}
   */
  export const parseItemList: CSSParser<Array<Item>> = map(
    pair(
      Stop.parse,
      oneOrMore(
        right(
          delimited(option(Token.parseWhitespace), Token.parseComma),
          pair(
            option(
              left(
                parseHint,
                delimited(option(Token.parseWhitespace), Token.parseComma)
              )
            ),
            Stop.parse
          )
        )
      )
    ),
    ([first, rest]) => {
      const items: Array<Item> = [first];

      for (const [hint, stop] of rest) {
        items.push(...hint, stop);
      }

      return items;
    }
  );

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-gradient}
   */
  export const parse: CSSParser<Gradient> = (input) =>
    either(Linear.parse(parseItemList), Radial.parse(parseItemList))(input);
}
