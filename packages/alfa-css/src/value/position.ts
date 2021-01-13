import { Hash } from "@siteimprove/alfa-hash";
import { Option, None, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Value } from "../value";

import { Keyword } from "./keyword";
import { Length } from "./length";
import { Percentage } from "./percentage";
import { Unit } from "./unit";
import { Slice } from "@siteimprove/alfa-slice";
import { Token } from "../syntax/token";
import { Err, Result } from "@siteimprove/alfa-result";

const { map, either, pair, right } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#position
 */
export class Position<
  H extends Position.Component<Position.Horizontal> = Position.Component<Position.Horizontal>,
  V extends Position.Component<Position.Vertical> = Position.Component<Position.Vertical>
> extends Value<"position"> {
  public static of<
    H extends Position.Component<Position.Horizontal>,
    V extends Position.Component<Position.Vertical>
  >(horizontal: H, vertical: V): Position<H, V> {
    return new Position(horizontal, vertical);
  }

  private readonly _vertical: V;
  private readonly _horizontal: H;

  private constructor(horizontal: H, vertical: V) {
    super();
    this._vertical = vertical;
    this._horizontal = horizontal;
  }

  public get type(): "position" {
    return "position";
  }

  public get vertical(): V {
    return this._vertical;
  }

  public get horizontal(): H {
    return this._horizontal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Position &&
      value._vertical.equals(this._vertical) &&
      value._horizontal.equals(this._horizontal)
    );
  }

  public hash(hash: Hash): void {
    this._vertical.hash(hash);
    this._horizontal.hash(hash);
  }

  public toJSON(): Position.JSON {
    return {
      type: "position",
      vertical: this._vertical.toJSON(),
      horizontal: this._horizontal.toJSON(),
    };
  }

  public toString(): string {
    return `${this._horizontal.toString()} ${this._vertical.toString()}`;
  }
}

export namespace Position {
  import parseWhitespace = Token.parseWhitespace;

  export interface JSON extends Value.JSON {
    type: "position";
    vertical: Component.JSON;
    horizontal: Component.JSON;
  }

  export type Center = Keyword<"center">;

  export const parseCenter = Keyword.parse("center");

  export type Vertical = Keyword<"top" | "bottom">;

  export const parseVertical = Keyword.parse("top", "bottom");

  export type Horizontal = Keyword<"left" | "right">;

  export const parseHorizontal = Keyword.parse("left", "right");

  export type Offset<U extends Unit.Length = Unit.Length> =
    | Length<U>
    | Percentage;

  export class Side<
    S extends Vertical | Horizontal = Vertical | Horizontal,
    O extends Offset = Offset
  > extends Value<"side"> {
    public static of<S extends Vertical | Horizontal, O extends Offset>(
      side: S,
      offset: Option<O> = None
    ): Side<S, O> {
      return new Side(side, offset);
    }

    private readonly _side: S;
    private readonly _offset: Option<O>;

    private constructor(side: S, offset: Option<O>) {
      super();
      this._side = side;
      this._offset = offset;
    }

    public get type(): "side" {
      return "side";
    }

    public get side(): S {
      return this._side;
    }

    public get offset(): Option<O> {
      return this._offset;
    }

    public isCenter(): boolean {
      return this._offset.some(
        (offset) => offset.type === "percentage" && offset.value === 0.5
      );
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Side &&
        value._side.equals(this._side) &&
        value._offset.equals(this._offset)
      );
    }

    public hash(hash: Hash): void {
      this._side.hash(hash);
      this._offset.hash(hash);
    }

    public toJSON(): Side.JSON {
      return {
        type: "side",
        side: this._side.toJSON(),
        offset: this._offset.map((offset) => offset.toJSON()).getOr(null),
      };
    }

    public toString(): string {
      return `${this._side.toString()}${this._offset
        .map((offset) => ` ${offset.toString()}`)
        .getOr("")}`;
    }
  }

  export namespace Side {
    export interface JSON extends Value.JSON {
      type: "side";
      side: Keyword.JSON;
      offset: Length.JSON | Percentage.JSON | null;
    }
  }

  export type Component<
    S extends Horizontal | Vertical = Horizontal | Vertical,
    U extends Unit.Length = Unit.Length
  > = Center | Offset<U> | Side<S, Offset<U>>;

  export namespace Component {
    export type JSON = Keyword.JSON | Length.JSON | Percentage.JSON | Side.JSON;

    export namespace Horizontal {
      export const parseKeyword = either(
        parseCenter,
        map(parseHorizontal, Side.of)
      );

      export const parseValue = map(
        either(Length.parse, Percentage.parse),
        (offset) => Side.of(Keyword.of("left"), Some.of(offset))
      );

      export const parseKeywordValue = map(
        pair(
          parseHorizontal,
          right(parseWhitespace, either(Length.parse, Percentage.parse))
        ),
        ([keyword, value]) => Side.of(keyword, Some.of(value))
      );

      export const parse = either(parseKeywordValue, parseKeyword, parseValue);
    }

    export namespace Vertical {
      export const parseKeyword = either(
        parseCenter,
        map(parseVertical, Side.of)
      );

      export const parseValue = map(
        either(Length.parse, Percentage.parse),
        (offset) => Side.of(Keyword.of("top"), Some.of(offset))
      );

      export const parseKeywordValue = map(
        pair(
          parseVertical,
          right(parseWhitespace, either(Length.parse, Percentage.parse))
        ),
        ([keyword, value]) => Side.of(keyword, Some.of(value))
      );

      export const parse = either(parseKeywordValue, parseKeyword, parseValue);
    }
  }

  /**
   * @see https://drafts.csswg.org/css-values-4/#typedef-position
   * @see https://drafts.csswg.org/css-backgrounds/#typedef-bg-position
   *
   * Parsing positions is a mess… It can be a 1, 2, 3, or 4 tokens value.
   * What the grammar doesn't say is that 3 is only allowed for background-position and
   * that the H/V components can only be switched when both start with a keyword.
   * Parsing has to be greedy, consuming as much as possible. So we check whether we can
   * get a 4, 3, 2, 1 match. It is hard to know whether a 1 match can be extended as a 2 match (it may depend on the 3 token also),
   * and so on, so it's easier to retry from the start. This should be OK performance wise since it
   * is not that much retry and it shouldn't be a type present in that many values…
   *
   * Notations: H/V: keyword for the component, h/v: numeric (length percentage), Hh/Vv: both keyword and numeric.
   * "center" may be used as H/V but not in Hh nor Vv…
   * * Accepted 4 tokens values: Hh Vv / Vv Hh
   * * Accepted 3 tokens values: Hh V / H Vv / Vv H / V Hh (only for background-position) (**not** h Vv, **not** Hh v)
   * * Accepted 2 tokens values: H V / H v / h V / h v / V H (**not** "Vv", **not** "v *", "H v" is **not** "Hh")
   * * Accepted 1 token values: H / V / h
   */
  export function parse(
    allowThreeTokens: boolean = false
  ): Parser<Slice<Token>, Position, string> {
    const mapHV = ([horizontal, vertical]: [
      Component<Horizontal>,
      Component<Vertical>
    ]) => Position.of(horizontal, vertical);
    const mapVH = ([vertical, horizontal]: [
      Component<Vertical>,
      Component<Horizontal>
    ]) => Position.of(horizontal, vertical);

    const { Horizontal, Vertical } = Component;

    const parse4 = either(
      map(
        pair(
          Horizontal.parseKeywordValue,
          right(parseWhitespace, Vertical.parseKeywordValue)
        ),
        mapHV
      ),
      map(
        pair(
          Vertical.parseKeywordValue,
          right(parseWhitespace, Horizontal.parseKeywordValue)
        ),
        mapVH
      )
    );

    const parse3 = allowThreeTokens
      ? either(
          map(
            either(
              pair(
                Horizontal.parseKeywordValue,
                right(parseWhitespace, Vertical.parseKeyword)
              ),
              pair(
                Horizontal.parseKeyword,
                right(parseWhitespace, Vertical.parseKeywordValue)
              )
            ),
            mapHV
          ),
          map(
            either(
              pair(
                Vertical.parseKeywordValue,
                right(parseWhitespace, Horizontal.parseKeyword)
              ),
              pair(
                Vertical.parseKeyword,
                right(parseWhitespace, Horizontal.parseKeywordValue)
              )
            ),
            mapVH
          )
        )
      : () => Err.of("Three-value syntax is not allowed");

    const parse2 = either(
      map(
        pair(
          either(Horizontal.parseKeyword, Horizontal.parseValue),
          right(
            parseWhitespace,
            either(Vertical.parseKeyword, Vertical.parseValue)
          )
        ),
        mapHV
      ),
      map(
        pair(
          Vertical.parseKeyword,
          right(parseWhitespace, Horizontal.parseKeyword)
        ),
        mapVH
      )
    );

    const parse1 = either(
      map(Horizontal.parseKeyword, (horizontal) =>
        Position.of<Component<Horizontal>, Component<Vertical>>(
          horizontal,
          Keyword.of("center")
        )
      ),
      map(Vertical.parseKeyword, (vertical) =>
        Position.of(Keyword.of("center"), vertical)
      ),
      map(Horizontal.parseValue, (horizontal) =>
        Position.of(horizontal, Keyword.of("center"))
      )
    );

    return either(parse4, parse3, parse2, parse1);
  }
}
