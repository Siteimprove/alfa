import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";

import { Angle } from "../angle";
import { Gradient } from "../gradient";
import { Position } from "../position";

const { map, either, pair, option, left, right, delimited } = Parser;

/**
 * @see https://drafts.csswg.org/css-images/#linear-gradients
 */
export class Linear<
  I extends Gradient.Item = Gradient.Item,
  D extends Linear.Direction = Linear.Direction
> implements Equatable, Serializable {
  public static of<I extends Gradient.Item, D extends Linear.Direction>(
    direction: D,
    items: Iterable<I>,
    repeats: boolean
  ): Linear<I, D> {
    return new Linear(direction, items, repeats);
  }

  private readonly _direction: D;
  private readonly _items: Array<I>;
  private readonly _repeats: boolean;

  private constructor(direction: D, items: Iterable<I>, repeats: boolean) {
    this._direction = direction;
    this._items = [...items];
    this._repeats = repeats;
  }

  public get type(): "gradient" {
    return "gradient";
  }

  public get kind(): "linear" {
    return "linear";
  }

  public get direction(): D {
    return this._direction;
  }

  public get items(): Iterable<I> {
    return this._items;
  }

  public get repeats(): boolean {
    return this._repeats;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Linear &&
      value._direction.equals(this._direction) &&
      value._items.length === this._items.length &&
      value._items.every((item, i) => item.equals(this._items[i]))
    );
  }

  public toJSON(): Linear.JSON {
    return {
      type: "gradient",
      kind: "linear",
      direction: this._direction.toJSON(),
      items: this._items.map(item => item.toJSON()),
      repeats: this._repeats
    };
  }

  public toString(): string {
    const args = [this._direction, ...this._items].join(", ");

    return `${this._repeats ? "repeating-" : ""}linear-gradient(${args})`;
  }
}

export namespace Linear {
  export interface JSON {
    [key: string]: json.JSON;
    type: "gradient";
    kind: "linear";
    direction: Direction.JSON;
    items: Array<Gradient.Item.JSON>;
    repeats: boolean;
  }

  export type Direction = Angle | Side | Corner;

  export namespace Direction {
    export type JSON = Angle.JSON | Side.JSON | Corner.JSON;
  }

  export class Side implements Equatable, Serializable {
    public static of(side: Position.Vertical | Position.Horizontal): Side {
      return new Side(side);
    }

    private readonly _side: Position.Vertical | Position.Horizontal;

    private constructor(side: Position.Vertical | Position.Horizontal) {
      this._side = side;
    }

    public get type(): "side" {
      return "side";
    }

    public get side(): Position.Vertical | Position.Horizontal {
      return this._side;
    }

    public equals(value: unknown): value is this {
      return value instanceof Side && value._side === this._side;
    }

    public toJSON(): Side.JSON {
      return {
        type: "side",
        side: this._side
      };
    }

    public toString(): string {
      return `to ${this._side}`;
    }
  }

  export namespace Side {
    export interface JSON {
      [key: string]: json.JSON;
      type: "side";
      side: Position.Vertical | Position.Horizontal;
    }
  }

  export class Corner implements Equatable, Serializable {
    public static of(
      vertical: Position.Vertical,
      horizontal: Position.Horizontal
    ): Corner {
      return new Corner(vertical, horizontal);
    }

    private readonly _vertical: Position.Vertical;
    private readonly _horizontal: Position.Horizontal;

    private constructor(
      vertical: Position.Vertical,
      horizontal: Position.Horizontal
    ) {
      this._vertical = vertical;
      this._horizontal = horizontal;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Corner &&
        value._vertical === this._vertical &&
        value._horizontal === this._horizontal
      );
    }

    public toJSON(): Corner.JSON {
      return {
        type: "corner",
        vertical: this._vertical,
        horizontal: this._horizontal
      };
    }

    public toString(): string {
      return `to ${this._vertical} ${this._horizontal}`;
    }
  }

  export namespace Corner {
    export interface JSON {
      [key: string]: json.JSON;
      type: "corner";
      vertical: Position.Vertical;
      horizontal: Position.Horizontal;
    }
  }

  /**
   * @see https://drafts.csswg.org/css-images/#typedef-side-or-corner
   */
  const parseSide = map(
    right(
      Token.parseIdent("to"),
      right(
        Token.parseWhitespace,
        either(Position.parseVertical, Position.parseHorizontal)
      )
    ),
    side => Side.of(side)
  );

  /**
   * @see https://drafts.csswg.org/css-images/#typedef-side-or-corner
   */
  const parseCorner = right(
    Token.parseIdent("to"),
    right(
      Token.parseWhitespace,
      either(
        map(
          pair(
            Position.parseVertical,
            right(Token.parseWhitespace, Position.parseHorizontal)
          ),
          ([vertical, horizontal]) => Corner.of(vertical, horizontal)
        ),
        map(
          pair(
            Position.parseHorizontal,
            right(Token.parseWhitespace, Position.parseVertical)
          ),
          ([horizontal, vertical]) => Corner.of(vertical, horizontal)
        )
      )
    )
  );

  export const parseDirection = either(
    Angle.parse,
    // Corners must be parsed before sides as sides are also valid prefixes of
    // corners.
    either(parseCorner, parseSide)
  );

  /**
   * @see https://drafts.csswg.org/css-images/#funcdef-linear-gradient
   */
  export const parse = map(
    pair(
      Token.parseFunction(
        fn =>
          fn.value === "linear-gradient" ||
          fn.value === "repeating-linear-gradient"
      ),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            option(
              left(
                parseDirection,
                delimited(option(Token.parseWhitespace), Token.parseComma)
              )
            ),
            Gradient.parseItemList
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    result => {
      const [fn, [direction, items]] = result;

      return Linear.of(
        direction.getOrElse(() => Side.of("bottom")),
        items,
        fn.value.startsWith("repeating")
      );
    }
  );
}
