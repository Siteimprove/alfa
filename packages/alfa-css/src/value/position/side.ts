import { Hash } from "@siteimprove/alfa-hash";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Parser as CSSParser, Token } from "../../syntax";
import { Unit } from "../../unit";

import { Keyword } from "../keyword";
import { Length, LengthPercentage, Percentage } from "../numeric";
import { Value } from "../value";

import { Keywords } from "./keywords";

const { either, map, pair, right } = Parser;

/**
 * @public
 */
export class Side<
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = boolean,
  S extends Keywords.Vertical | Keywords.Horizontal =
    | Keywords.Vertical
    | Keywords.Horizontal,
  O extends LengthPercentage<U, CALC> = LengthPercentage<U, CALC>
> extends Value<"side", CALC> {
  public static of<S extends Keywords.Vertical | Keywords.Horizontal>(
    side: S
  ): Side<Unit.Length, false, S>;

  public static of<
    U extends Unit.Length,
    CALC extends boolean,
    S extends Keywords.Vertical | Keywords.Horizontal,
    O extends LengthPercentage<U, CALC>
  >(side: S, offset?: Option<O>): Side<U, CALC, S, O>;
  public static of<
    U extends Unit.Length,
    CALC extends boolean,
    S extends Keywords.Vertical | Keywords.Horizontal,
    O extends LengthPercentage<U, CALC>
  >(side: S, offset: Option<O> = None): Side<U, CALC, S, O> {
    return new Side(side, offset);
  }

  private readonly _side: S;
  private readonly _offset: Option<O>;

  private constructor(side: S, offset: Option<O>) {
    super("side", offset.some((offset) => offset.hasCalculation()) as CALC);
    this._side = side;
    this._offset = offset;
  }

  public get side(): S {
    return this._side;
  }

  public get offset(): Option<O> {
    return this._offset;
  }

  public resolve(resolver: LengthPercentage.Resolver): Side.Canonical<S> {
    return new Side(
      this._side,
      this._offset.map(LengthPercentage.resolve(resolver))
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
    Side<"px", false, S, LengthPercentage.Canonical>;

  export type PartiallyResolved<
    S extends Keywords.Vertical | Keywords.Horizontal
  > = Side<"px", false, S, Length.Canonical | Percentage.Fixed>;

  export interface JSON extends Value.JSON<"side"> {
    side: Keyword.JSON;
    offset: LengthPercentage.JSON | null;
  }

  /**
   * Parse a side keyword (top/bottom/left/right) or "center"
   *
   * @private
   */
  function parseKeyword<S extends Keywords.Horizontal | Keywords.Vertical>(
    parser: CSSParser<S>
  ): CSSParser<Keyword<"center"> | Side<Unit.Length, false, S>> {
    return either(
      Keywords.parseCenter,
      map<Slice<Token>, S, Side<Unit.Length, false, S>, string>(parser, Side.of)
    );
  }

  /**
   * Parse a side keyword followed by an offset (length-percentage).
   *
   * @private
   */
  function parseKeywordValue<S extends Keywords.Horizontal | Keywords.Vertical>(
    parser: CSSParser<S>
  ): CSSParser<Side<Unit.Length, false, S>> {
    return map(
      pair(parser, right(Token.parseWhitespace, LengthPercentage.parseBase)),
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
