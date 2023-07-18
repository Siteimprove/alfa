import { Hash } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Parser as CSSParser, Token } from "../../syntax";
import { Unit } from "../../unit";

import { Keyword } from "../keyword";
import { Length, LengthPercentage } from "../numeric";
import { Value } from "../value";

import { Keywords } from "./keywords";

const { either, map, pair, right } = Parser;

/**
 * @public
 */
export class Side<
  S extends Keywords.Vertical | Keywords.Horizontal =
    | Keywords.Vertical
    | Keywords.Horizontal,
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = boolean,
  O extends LengthPercentage<U, CALC> = LengthPercentage<U, CALC>
> extends Value<"side", CALC> {
  public static of<S extends Keywords.Vertical | Keywords.Horizontal>(
    side: S
  ): Side<S, Unit.Length, false>;

  public static of<
    S extends Keywords.Vertical | Keywords.Horizontal,
    U extends Unit.Length,
    CALC extends boolean,
    O extends LengthPercentage<U, CALC>
  >(side: S, offset: O): Side<S, U, CALC, O>;

  public static of<
    S extends Keywords.Vertical | Keywords.Horizontal,
    U extends Unit.Length,
    CALC extends boolean,
    O extends LengthPercentage<U, CALC>
  >(side: S, offset: Option<O>): Side<S, U, CALC, O>;

  public static of<
    S extends Keywords.Vertical | Keywords.Horizontal,
    U extends Unit.Length,
    CALC extends boolean,
    O extends LengthPercentage<U, CALC>
  >(side: S, offset?: O | Option<O>): Side<S, U, CALC, O> {
    return new Side(
      side,
      Option.isOption(offset) ? offset : Option.from(offset)
    );
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

  public resolve(resolver: Side.Resolver): Side.Canonical<S> {
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
    Side<S, "px", false, LengthPercentage.Canonical>;

  export type PartiallyResolved<
    S extends Keywords.Vertical | Keywords.Horizontal
  > = Side<S, "px", boolean, LengthPercentage.PartiallyResolved>;

  export interface JSON extends Value.JSON<"side"> {
    side: Keyword.JSON;
    offset: LengthPercentage.JSON | null;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartialResolver = Length.Resolver;

  export function partiallyResolve<
    S extends Keywords.Vertical | Keywords.Horizontal
  >(resolver: PartialResolver): (side: Side<S>) => PartiallyResolved<S> {
    return (side) =>
      Side.of(
        side.side,
        side.offset.map(LengthPercentage.partiallyResolve(resolver))
      );
  }

  export function isSide(value: unknown): value is Side {
    return value instanceof Side;
  }

  /**
   * Parse a side keyword (top/bottom/left/right) or "center"
   */
  function parseKeyword<
    S extends Keywords.Horizontal | Keywords.Vertical,
    CALC extends boolean
  >(
    parser: CSSParser<S>,
    // This is a useless parameter, temporarily used to enforce inference of CALC
    // at call sites.
    withCalculation: CALC
  ): CSSParser<Keyword<"center"> | Side<S, Unit.Length, CALC>> {
    return either(
      Keywords.parseCenter,
      // This is asserting false => true i.e. losing the fact that there is
      // no calculation in the Keyword. This is acceptable.
      map(parser, (side) => Side.of(side) as Side<S, Unit.Length, CALC>)
    );
  }

  /**
   * Parse a side keyword followed by an offset (length-percentage).
   *
   * @TODO
   * The withCalculation parameter (and CALC type parameter) is temporally needed
   * until Shape and Gradient are properly migrated to calculatable values.
   */
  function parseKeywordValue<
    S extends Keywords.Horizontal | Keywords.Vertical,
    CALC extends boolean
  >(
    parser: CSSParser<S>,
    withCalculation: CALC
  ): CSSParser<Side<S, Unit.Length, CALC>> {
    const offsetParser = (
      withCalculation ? LengthPercentage.parse : LengthPercentage.parseBase
    ) as CSSParser<LengthPercentage<Unit.Length, CALC>>;

    return map(
      pair(parser, right(Token.parseWhitespace, offsetParser)),
      ([keyword, value]) => Side.of(keyword, value)
    );
  }

  export const parseHorizontalKeywordValue = <CALC extends boolean>(
    withCalculation: CALC
  ) => parseKeywordValue(Keywords.parseHorizontal, withCalculation);

  export const parseHorizontalKeyword = <CALC extends boolean>(
    withCalculation: CALC
  ) => parseKeyword(Keywords.parseHorizontal, withCalculation);

  export const parseHorizontal = <CALC extends boolean>(
    withCalculation: CALC
  ) =>
    either(
      parseHorizontalKeyword(withCalculation),
      parseHorizontalKeywordValue(withCalculation)
    );

  export const parseVerticalKeywordValue = <CALC extends boolean>(
    withCalculation: CALC
  ) => parseKeywordValue(Keywords.parseVertical, withCalculation);

  export const parseVerticalKeyword = <CALC extends boolean>(
    withCalculation: CALC
  ) => parseKeyword(Keywords.parseVertical, withCalculation);

  export const parseVertical = <CALC extends boolean>(withCalculation: CALC) =>
    either(
      parseVerticalKeyword(withCalculation),
      parseVerticalKeywordValue(withCalculation)
    );
}
