import { Hash } from "@siteimprove/alfa-hash";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Err } from "@siteimprove/alfa-result";

import { Keyword } from "./keyword";
import { Length, Percentage } from "./numeric";

import { Token } from "../syntax";
import { Unit } from "../unit";
import { Value } from "./value";

const { map, either, pair, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#position}
 *
 * @public
 */
export class Position<
  H extends Position.Component<Position.Keywords.Horizontal> = Position.Component<Position.Keywords.Horizontal>,
  V extends Position.Component<Position.Keywords.Vertical> = Position.Component<Position.Keywords.Vertical>
> extends Value<"position", false> {
  public static of<
    H extends Position.Component<Position.Keywords.Horizontal>,
    V extends Position.Component<Position.Keywords.Vertical>
  >(horizontal: H, vertical: V): Position<H, V> {
    return new Position(horizontal, vertical);
  }

  private readonly _horizontal: H;
  private readonly _vertical: V;

  private constructor(horizontal: H, vertical: V) {
    super("position", false);
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get horizontal(): H {
    return this._horizontal;
  }

  public get vertical(): V {
    return this._vertical;
  }

  public resolve(): Position<H, V> {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Position &&
      value._horizontal.equals(this._horizontal) &&
      value._vertical.equals(this._vertical)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._horizontal).writeHashable(this._vertical);
  }

  public toJSON(): Position.JSON {
    return {
      ...super.toJSON(),
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
    };
  }

  public toString(): string {
    return `${this._horizontal} ${this._vertical}`;
  }
}

/**
 * @public
 */
export namespace Position {
  export interface JSON extends Value.JSON<"position"> {
    horizontal: Component.JSON;
    vertical: Component.JSON;
  }

  export namespace Keywords {
    export type Center = Keyword<"center">;

    /**
     * @internal
     */
    export const parseCenter = Keyword.parse("center");

    export type Vertical = Keyword<"top"> | Keyword<"bottom">;

    /**
     * @internal
     */
    export const parseVertical = Keyword.parse("top", "bottom");

    export type Horizontal = Keyword<"left"> | Keyword<"right">;

    /**
     * @internal
     */
    export const parseHorizontal = Keyword.parse("left", "right");
  }

  type Offset<U extends Unit.Length = Unit.Length> =
    | Length.Fixed<U>
    | Percentage.Fixed;

  namespace Offset {
    export const parse = either(Length.parseBase, Percentage.parseBase);
  }

  export class Side<
    S extends Keywords.Vertical | Keywords.Horizontal =
      | Keywords.Vertical
      | Keywords.Horizontal,
    O extends Offset = Offset
  > extends Value<"side", false> {
    public static of<
      S extends Keywords.Vertical | Keywords.Horizontal,
      O extends Offset
    >(side: S, offset: Option<O> = None): Side<S, O> {
      return new Side(side, offset);
    }

    private readonly _side: S;
    private readonly _offset: Option<O>;

    private constructor(side: S, offset: Option<O>) {
      super("side", false);
      this._side = side;
      this._offset = offset;
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

    public resolve(): Side<S, O> {
      return this;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Side &&
        value._side.equals(this._side) &&
        value._offset.equals(this._offset)
      );
    }

    public hash(hash: Hash): void {
      hash.writeHashable(this._side).writeHashable(this._offset);
    }

    public toJSON(): Side.JSON {
      return {
        ...super.toJSON(),
        side: this._side.toJSON(),
        offset: this._offset.map((offset) => offset.toJSON()).getOr(null),
      };
    }

    public toString(): string {
      return `${this._side}${this._offset
        .map((offset) => ` ${offset}`)
        .getOr("")}`;
    }
  }

  export namespace Side {
    export interface JSON extends Value.JSON<"side"> {
      side: Keyword.JSON;
      offset: Length.Fixed.JSON | Percentage.Fixed.JSON | null;
    }

    /**
     * Parse a side keyword (top/bottom/left/right) or "center"
     *
     * @private
     */
    function parseKeyword<S extends Keywords.Horizontal | Keywords.Vertical>(
      parser: Parser<Slice<Token>, S, string>
    ): Parser<Slice<Token>, Keyword<"center"> | Side<S>, string> {
      return either(Keywords.parseCenter, map(parser, Side.of));
    }

    /**
     * Parse a side keyword followed by an offset (Length | Percentage).
     *
     * @private
     */
    function parseKeywordValue<
      S extends Keywords.Horizontal | Keywords.Vertical
    >(
      parser: Parser<Slice<Token>, S, string>
    ): Parser<Slice<Token>, Side<S>, string> {
      return map(
        pair(parser, right(Token.parseWhitespace, Offset.parse)),
        ([keyword, value]) => Side.of(keyword, Option.of(value))
      );
    }

    export const parseHorizontalKeywordValue = parseKeywordValue(
      Keywords.parseHorizontal
    );
    export const parseHorizontalKeyword = parseKeyword(
      Keywords.parseHorizontal
    );
    export const parseVerticalKeywordValue = parseKeywordValue(
      Keywords.parseVertical
    );
    export const parseVerticalKeyword = parseKeyword(Keywords.parseVertical);

    export const parseHorizontal = either(
      parseHorizontalKeyword,
      parseHorizontalKeywordValue
    );
    export const parseVertical = either(
      parseVerticalKeyword,
      parseVerticalKeywordValue
    );
  }

  export type Component<
    S extends Keywords.Horizontal | Keywords.Vertical =
      | Keywords.Horizontal
      | Keywords.Vertical,
    U extends Unit.Length = Unit.Length
  > = Keywords.Center | Offset<U> | Side<S, Offset<U>>;

  export namespace Component {
    export type JSON =
      | Keyword.JSON
      | Length.Fixed.JSON
      | Percentage.Fixed.JSON
      | Side.JSON;

    // "center" is included in Side.parse[Horizontal, Vertical]
    export const parseHorizontal = either(Offset.parse, Side.parseHorizontal);
    export const parseVertical = either(Offset.parse, Side.parseVertical);
  }

  /**
   * @remarks
   * Positions can be declared using either 1, 2, 3, or 4 tokens with the
   * longest possible match taking precedence. The 3-token syntax is deprecated
   * and must be selectively enabled.
   *
   * It is not easy to reuse component parsing here because, for example,
   * H v would be incorrectly parsed as Hh by the horizontal component parser,
   * so we need parsing error recovery to happen globally.
   * Moreover, the parsers must be tested in decreasing number of tokens so that
   * the 1 token parser does not eagerly accept something which actually has 4
   * tokens.
   *
   * Notation:
   *
   *   - H/V: keyword, top | bottom | right | left | center
   *   - h/v: numeric, \<length | percentage\>
   *   - Hh/Vv: keyword (excluding center) and numeric
   *
   * Syntax:
   *
   *   - 4 tokens: Hh Vv | Vv Hh
   *   - 3 tokens: Hh V | H Vv | Vv H | V Hh
   *   - 2 tokens: H V | H v | h V | h v | V H
   *   - 1 token:  H | V | h
   */
  const mapHV = ([horizontal, vertical]: [
    Component<Keywords.Horizontal>,
    Component<Keywords.Vertical>
  ]) => Position.of(horizontal, vertical);

  const mapVH = ([vertical, horizontal]: [
    Component<Keywords.Vertical>,
    Component<Keywords.Horizontal>
  ]) => Position.of(horizontal, vertical);

  const {
    parseHorizontalKeywordValue,
    parseHorizontalKeyword,
    parseVerticalKeywordValue,
    parseVerticalKeyword,
  } = Side;

  // Hh Vv | Vv Hh
  const parse4 = either(
    map(
      pair(
        parseHorizontalKeywordValue,
        right(Token.parseWhitespace, parseVerticalKeywordValue)
      ),
      mapHV
    ),
    map(
      pair(
        parseVerticalKeywordValue,
        right(Token.parseWhitespace, parseHorizontalKeywordValue)
      ),
      mapVH
    )
  );

  // Hh V | H Vv | Vv H | V Hh
  const parse3 = either(
    map(
      either(
        pair(
          parseHorizontalKeywordValue,
          right(Token.parseWhitespace, parseVerticalKeyword)
        ),
        pair(
          parseHorizontalKeyword,
          right(Token.parseWhitespace, parseVerticalKeywordValue)
        )
      ),
      mapHV
    ),
    map(
      either(
        pair(
          parseVerticalKeywordValue,
          right(Token.parseWhitespace, parseHorizontalKeyword)
        ),
        pair(
          parseVerticalKeyword,
          right(Token.parseWhitespace, parseHorizontalKeywordValue)
        )
      ),
      mapVH
    )
  );
  // H V | H v | h V | h v | V H = (H | h) (V | v) | V H
  const parse2 = either(
    map(
      pair(
        either(parseHorizontalKeyword, Offset.parse),
        right(Token.parseWhitespace, either(parseVerticalKeyword, Offset.parse))
      ),
      mapHV
    ),
    map(
      pair(
        parseVerticalKeyword,
        right(Token.parseWhitespace, parseHorizontalKeyword)
      ),
      mapVH
    )
  );

  // H | V | h
  const parse1 = either(
    map(parseHorizontalKeyword, (horizontal) =>
      Position.of<Component<Keywords.Horizontal>, Component<Keywords.Vertical>>(
        horizontal,
        Keyword.of("center")
      )
    ),
    map(parseVerticalKeyword, (vertical) =>
      Position.of(Keyword.of("center"), vertical)
    ),
    map(Offset.parse, (horizontal) =>
      Position.of(horizontal, Keyword.of("center"))
    )
  );

  /**
   *
   * {@link https://drafts.csswg.org/css-values/#typedef-position}
   * {@link https://drafts.csswg.org/css-backgrounds/#typedef-bg-position}
   */
  export function parse(
    legacySyntax: boolean = false
  ): Parser<Slice<Token>, Position, string> {
    return either(
      parse4,
      legacySyntax ? parse3 : () => Err.of("Three-value syntax is not allowed"),
      parse2,
      parse1
    );
  }
}
