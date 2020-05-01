import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

import { Color } from "./color";
import { Length } from "./length";
import { Percentage } from "./percentage";

const { either, pair, map, option, oneOrMore, delimited, left, right } = Parser;

/**
 * @see https://drafts.csswg.org/css-images/#gradients
 */
export type Gradient = Linear;

export namespace Gradient {
  export type JSON = Linear.JSON;

  /**
   * @see https://drafts.csswg.org/css-images/#color-stop
   */
  export class Stop<
    C extends Color = Color,
    P extends Length | Percentage = Length | Percentage
  > implements Equatable, Hashable, Serializable {
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
      this._color.hash(hash);
      this._position.hash(hash);
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
   * @see https://drafts.csswg.org/css-images/#typedef-linear-color-stop
   */
  export const parseStop = either(
    either(
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
      )
    ),
    map(Color.parse, (color) => Stop.of(color))
  );

  /**
   * @see https://drafts.csswg.org/css-images/#color-transition-hint
   */
  export class Hint<P extends Length | Percentage = Length | Percentage>
    implements Equatable, Hashable, Serializable {
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
      this._position.hash(hash);
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
   * @see https://drafts.csswg.org/css-images/#typedef-linear-color-hint
   */
  export const parseHint = map(
    either(Length.parse, Percentage.parse),
    (position) => Hint.of(position)
  );

  export type Item = Stop | Hint;

  export namespace Item {
    export type JSON = Stop.JSON | Hint.JSON;
  }

  export const parseItem = either(parseStop, parseHint);

  /**
   * @see https://drafts.csswg.org/css-images/#typedef-color-stop-list
   */
  export const parseItemList = map(
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
    (result) => {
      const [first, rest] = result;

      return Iterable.concat(
        [first],
        Iterable.flatMap(rest, ([hint, stop]) => [...hint, stop])
      );
    }
  );
}

// `Linear` depends on `Gradient` so the import of `Linear` must be moved after
// the initial declaration of `Gradient`.
import { Linear } from "./gradient/linear";

export namespace Gradient {
  /**
   * @see https://drafts.csswg.org/css-images/#typedef-gradient
   */
  export const parse = Linear.parse;
}
