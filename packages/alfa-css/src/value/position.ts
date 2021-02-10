import { Hash } from "@siteimprove/alfa-hash";
import { Option, None, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Err } from "@siteimprove/alfa-result";

import { Token } from "../syntax/token";
import { Value } from "../value";
import { Keyword } from "./keyword";
import { Length } from "./length";
import { Percentage } from "./percentage";
import { Unit } from "./unit";

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

  private readonly _horizontal: H;
  private readonly _vertical: V;

  private constructor(horizontal: H, vertical: V) {
    super();
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get type(): "position" {
    return "position";
  }

  public get horizontal(): H {
    return this._horizontal;
  }

  public get vertical(): V {
    return this._vertical;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Position &&
      value._horizontal.equals(this._horizontal) &&
      value._vertical.equals(this._vertical)
    );
  }

  public hash(hash: Hash): void {
    this._horizontal.hash(hash);
    this._vertical.hash(hash);
  }

  public toJSON(): Position.JSON {
    return {
      type: "position",
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
    };
  }

  public toString(): string {
    return `${this._horizontal.toString()} ${this._vertical.toString()}`;
  }
}

export namespace Position {
  import parseWhitespace = Token.parseWhitespace;

  export interface JSON extends Value.JSON<"position"> {
    horizontal: Component.JSON;
    vertical: Component.JSON;
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
    export interface JSON extends Value.JSON<"side"> {
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

    export const parseValue = either(Length.parse, Percentage.parse);

    export namespace Horizontal {
      export const parseKeyword = either(
        parseCenter,
        map(parseHorizontal, Side.of)
      );

      export const parseKeywordValue = map(
        pair(
          parseHorizontal,
          right(parseWhitespace, either(Length.parse, Percentage.parse))
        ),
        ([keyword, value]) => Side.of(keyword, Some.of(value))
      );

      export const parse = either<Slice<Token>, Component<Horizontal>, string>(
        parseKeywordValue,
        parseKeyword,
        parseValue
      );
    }

    export namespace Vertical {
      export const parseKeyword = either(
        parseCenter,
        map(parseVertical, Side.of)
      );

      export const parseKeywordValue = map(
        pair(
          parseVertical,
          right(parseWhitespace, either(Length.parse, Percentage.parse))
        ),
        ([keyword, value]) => Side.of(keyword, Some.of(value))
      );

      export const parse = either<Slice<Token>, Component<Vertical>, string>(
        parseKeywordValue,
        parseKeyword,
        parseValue
      );
    }
  }

  /**
   * @remarks
   * Positions can be declared using either 1, 2, 3, or 4 tokens with the
   * longest possible match taking precedence. The 3-token syntax is deprecated
   * and must be selectively enabled.
   *
   * Notation:
   *
   *   - H/V: keyword, top | bottom | right | left | center
   *   - h/v: numeric, <length | percentage>
   *   - Hh/Vv: keyword (excluding center) and numeric
   *
   * Syntax:
   *
   *   - 4 tokens: Hh Vv | Vv Hh
   *   - 3 tokens: Hh V | H Vv | Vv H | V Hh
   *   - 2 tokens: H V | H v | h V | h v | V H
   *   - 1 token:  H | V | h
   *
   * @see https://drafts.csswg.org/css-values/#typedef-position
   * @see https://drafts.csswg.org/css-backgrounds/#typedef-bg-position
   */
  export function parse(
    legacySyntax: boolean = false
  ): Parser<Slice<Token>, Position, string> {
    const mapHV = ([horizontal, vertical]: [
      Component<Horizontal>,
      Component<Vertical>
    ]) => Position.of(horizontal, vertical);

    const mapVH = ([vertical, horizontal]: [
      Component<Vertical>,
      Component<Horizontal>
    ]) => Position.of(horizontal, vertical);

    const { Horizontal, Vertical, parseValue } = Component;

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

    const parse3 = legacySyntax
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
          either(Horizontal.parseKeyword, parseValue),
          right(parseWhitespace, either(Vertical.parseKeyword, parseValue))
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
      map(parseValue, (horizontal) =>
        Position.of(horizontal, Keyword.of("center"))
      )
    );

    return either(parse4, parse3, parse2, parse1);
  }
}
