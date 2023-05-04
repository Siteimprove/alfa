import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax";

import { Color } from "../color";
import { Length, Percentage } from "../../calculation";

import { Linear, Radial } from "./index";

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
  export type JSON = Linear.JSON | Radial.JSON;

  /**
   * {@link https://drafts.csswg.org/css-images/#color-stop}
   */
  export class Stop<
    C extends Color = Color,
    P extends Length | Percentage = Length | Percentage
  > implements Equatable, Hashable, Serializable
  {
    public static of<C extends Color, P extends Length | Percentage>(
      color: C,
      position: Option<P> = None
    ): Stop<C, P> {
      return new Stop(color, position);
    }

    private readonly _color: C;
    private readonly _position: Option<P>;

    private constructor(color: C, position: Option<P>) {
      this._color = color;
      this._position = position;
    }

    public get type(): "stop" {
      return "stop";
    }

    public get color(): C {
      return this._color;
    }

    public get position(): Option<P> {
      return this._position;
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
        type: "stop",
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
    export interface JSON {
      [key: string]: json.JSON;
      type: "stop";
      color: Color.JSON;
      position: Length.JSON | Percentage.JSON | null;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-stop}
   */
  export const parseStop: Parser<Slice<Token>, Stop, string> = either(
    map(
      pair(
        left(Color.parse, Token.parseWhitespace),
        either(Length.parse, Percentage.parse)
      ),
      (result) => {
        const [color, position] = result;
        return Stop.of(color, Option.of(position));
      }
    ),
    map(
      pair(
        either(Length.parse, Percentage.parse),
        right(Token.parseWhitespace, Color.parse)
      ),
      (result) => {
        const [position, color] = result;
        return Stop.of(color, Option.of(position));
      }
    ),
    map(Color.parse, (color) => Stop.of(color))
  );

  /**
   * {@link https://drafts.csswg.org/css-images/#color-transition-hint}
   */
  export class Hint<P extends Length | Percentage = Length | Percentage>
    implements Equatable, Hashable, Serializable
  {
    public static of<P extends Length | Percentage>(position: P): Hint<P> {
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
    export interface JSON {
      [key: string]: json.JSON;
      type: "hint";
      position: Length.JSON | Percentage.JSON;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-hint}
   */
  export const parseHint: Parser<Slice<Token>, Hint, string> = map(
    either(Length.parse, Percentage.parse),
    (position) => Hint.of(position)
  );

  export type Item = Stop | Hint;

  export namespace Item {
    export type JSON = Stop.JSON | Hint.JSON;
  }

  export const parseItem: Parser<Slice<Token>, Item, string> = either(
    parseStop,
    parseHint
  );

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-color-stop-list}
   */
  export const parseItemList: Parser<Slice<Token>, Array<Item>, string> = map(
    pair(
      parseStop,
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
            parseStop
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
  export const parse: Parser<Slice<Token>, Gradient, string> = (input) =>
    either(Linear.parse, Radial.parse)(input);
}
