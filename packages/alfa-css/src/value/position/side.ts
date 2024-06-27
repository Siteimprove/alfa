import { Hash } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import { Keyword } from "../keyword.js";
import { LengthPercentage } from "../numeric/index.js";
import type { PartiallyResolvable, Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

import { Keywords } from "./keywords.js";

const { either, map, pair, right } = Parser;

/**
 * @public
 */
export class Side<
    S extends Keywords.Vertical | Keywords.Horizontal =
      | Keywords.Vertical
      | Keywords.Horizontal,
    O extends LengthPercentage = LengthPercentage,
  >
  extends Value<"side", Value.HasCalculation<[O]>>
  implements
    Resolvable<Side.Canonical<S>, Side.Resolver>,
    PartiallyResolvable<Side.PartiallyResolved<S>, Side.PartialResolver>
{
  public static of<S extends Keywords.Vertical | Keywords.Horizontal>(
    side: S,
  ): Side<S, never>;

  public static of<
    S extends Keywords.Vertical | Keywords.Horizontal,
    O extends LengthPercentage,
  >(side: S, offset: O): Side<S, O>;

  public static of<
    S extends Keywords.Vertical | Keywords.Horizontal,
    O extends LengthPercentage,
  >(side: S, offset: Option<O>): Side<S, O>;

  public static of<
    S extends Keywords.Vertical | Keywords.Horizontal,
    O extends LengthPercentage,
  >(side: S, offset?: O | Option<O>): Side<S, O> {
    return new Side(
      side,
      Option.isOption(offset) ? offset : Option.from(offset),
    );
  }

  private readonly _side: S;
  private readonly _offset: Option<O>;

  private constructor(side: S, offset: Option<O>) {
    super(
      "side",
      offset.some(Value.hasCalculation) as Value.HasCalculation<[O]>,
    );
    this._side = side;
    this._offset = offset;
  }

  public get side(): S {
    return this._side;
  }

  public get offset(): Option<O> {
    return this._offset;
  }

  public resolve(resolver: Side.Resolver): Side.Canonical<S> {
    return new Side(
      this._side,
      this._offset.map(LengthPercentage.resolve(resolver)),
    );
  }

  public partiallyResolve(
    resolver: Side.PartialResolver,
  ): Side.PartiallyResolved<S> {
    return new Side(
      this._side,
      this._offset.map(LengthPercentage.partiallyResolve(resolver)),
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
    Side<S, LengthPercentage.Canonical>;

  export type PartiallyResolved<
    S extends Keywords.Vertical | Keywords.Horizontal,
  > = Side<S, LengthPercentage.PartiallyResolved>;

  export interface JSON extends Value.JSON<"side"> {
    side: Keyword.JSON;
    offset: LengthPercentage.JSON | null;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartialResolver = LengthPercentage.PartialResolver;

  export function isSide(value: unknown): value is Side {
    return value instanceof Side;
  }

  /**
   * Parse a side keyword (top/bottom/left/right) or "center"
   */
  function parseKeyword<S extends Keywords.Horizontal | Keywords.Vertical>(
    parser: CSSParser<S>,
  ): CSSParser<Keyword<"center"> | Side<S, never>> {
    return either(
      Keywords.parseCenter,
      map(parser, (side) => Side.of(side) as Side<S, never>),
    );
  }

  /**
   * Parse a side keyword followed by an offset (length-percentage).
   */
  function parseKeywordValue<S extends Keywords.Horizontal | Keywords.Vertical>(
    parser: CSSParser<S>,
  ): CSSParser<Side<S>> {
    return map(
      pair(parser, right(Token.parseWhitespace, LengthPercentage.parse)),
      ([keyword, value]) => Side.of(keyword, value),
    );
  }

  export const parseHorizontalKeywordValue = parseKeywordValue(
    Keywords.parseHorizontal,
  );

  export const parseHorizontalKeyword = parseKeyword(Keywords.parseHorizontal);

  export const parseHorizontal = either(
    parseHorizontalKeyword,
    parseHorizontalKeywordValue,
  );

  export const parseVerticalKeywordValue = parseKeywordValue(
    Keywords.parseVertical,
  );

  export const parseVerticalKeyword = parseKeyword(Keywords.parseVertical);

  export const parseVertical = either(
    parseVerticalKeyword,
    parseVerticalKeywordValue,
  );
}
