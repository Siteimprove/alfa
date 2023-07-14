import { Hash } from "@siteimprove/alfa-hash";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser, Token } from "../../syntax";

import { Keyword } from "../keyword";
import { Length, Percentage } from "../numeric";
import { Value } from "../value";

import { Keywords } from "./keywords";
import { Offset } from "./offset";

const { either, map, pair, right } = Parser;

/**
 * @public
 */
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

/**
 * @public
 */
export namespace Side {
  export type Canonical<S extends Keywords.Vertical | Keywords.Horizontal> =
    Side<S, Percentage.Canonical | Length.Canonical>;

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
    parser: CSSParser<S>
  ): CSSParser<Keyword<"center"> | Side<S>> {
    return either(Keywords.parseCenter, map(parser, Side.of));
  }

  /**
   * Parse a side keyword followed by an offset (Length | Percentage).
   *
   * @private
   */
  function parseKeywordValue<S extends Keywords.Horizontal | Keywords.Vertical>(
    parser: CSSParser<S>
  ): CSSParser<Side<S>> {
    return map(
      pair(parser, right(Token.parseWhitespace, Offset.parse)),
      ([keyword, value]) => Side.of(keyword, Option.of(value))
    );
  }

  export const parseHorizontalKeywordValue = parseKeywordValue(
    Keywords.parseHorizontal
  );
  export const parseHorizontalKeyword = parseKeyword(Keywords.parseHorizontal);
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
