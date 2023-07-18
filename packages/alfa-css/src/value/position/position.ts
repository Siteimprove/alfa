import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";

import { type Parser as CSSParser, Token } from "../../syntax";
import { Unit } from "../../unit";

import { Keyword } from "../keyword";
import { Length } from "../numeric";
import { Value } from "../value";

import * as component from "./component";
import * as keywords from "./keywords";
import * as side from "./side";

const { map, either, pair, right } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#position}
 *
 * @remarks
 * A Position has a horizontal and a vertical component, corresponding to some
 * coordinates. Each component can either be an offset (implicitly from the
 * "start" side (left or top, usually)), or the keyword "center", or a Side
 * (i.e. an explicit side with an optional offset).
 *
 * @public
 */
export class Position<
  H extends Position.Keywords.Horizontal = Position.Keywords.Horizontal,
  V extends Position.Keywords.Vertical = Position.Keywords.Vertical,
  HC extends Position.Component<H> = Position.Component<H>,
  VC extends Position.Component<V> = Position.Component<V>,
  CALC extends boolean = boolean
> extends Value<"position", CALC> {
  public static of<
    H extends Position.Keywords.Horizontal = Position.Keywords.Horizontal,
    V extends Position.Keywords.Vertical = Position.Keywords.Vertical,
    HC extends Position.Component<H> = Position.Component<H>,
    VC extends Position.Component<V> = Position.Component<V>
  >(
    horizontal: HC,
    vertical: VC
  ): Position<H, V, HC, VC, Value.HasCalculation<[HC, VC]>> {
    const calculation = (horizontal.hasCalculation() ||
      vertical.hasCalculation()) as Value.HasCalculation<[HC, VC]>;
    return new Position(horizontal, vertical, calculation);
  }

  private readonly _horizontal: HC;
  private readonly _vertical: VC;

  private constructor(horizontal: HC, vertical: VC, calculation: CALC) {
    super("position", calculation);
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get horizontal(): HC {
    return this._horizontal;
  }

  public get vertical(): VC {
    return this._vertical;
  }

  public resolve(resolver: Position.Resolver): Position.Canonical<H, V> {
    return new Position(
      Position.Component.resolve<H>({
        length: resolver.length,
        percentageBase: resolver.percentageHBase,
      })(this._horizontal),
      Position.Component.resolve<V>({
        length: resolver.length,
        percentageBase: resolver.percentageVBase,
      })(this._vertical),
      false
    );
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
  export type Canonical<
    H extends Keywords.Horizontal = Keywords.Horizontal,
    V extends Keywords.Vertical = Keywords.Vertical
  > = Position<H, V, Component.Canonical<H>, Component.Canonical<V>, false>;

  export type PartiallyResolved<
    H extends Keywords.Horizontal = Keywords.Horizontal,
    V extends Keywords.Vertical = Keywords.Vertical
  > = Position<
    H,
    V,
    Component.PartiallyResolved<H>,
    Component.PartiallyResolved<V>
  >;

  /**
   * @internal
   */
  export type Fixed<
    H extends Keywords.Horizontal = Keywords.Horizontal,
    V extends Keywords.Vertical = Keywords.Vertical
  > = Position<H, V, Component.Fixed<H>, Component.Fixed<V>, false>;

  export interface JSON extends Value.JSON<"position"> {
    horizontal: Component.JSON;
    vertical: Component.JSON;
  }

  export import Keywords = keywords.Keywords;

  export import Side = side.Side;

  export import Component = component.Component;

  /**
   * Percentages are not resolved against the same base in both dimensions.
   */
  export interface Resolver extends Length.Resolver {
    percentageHBase: Length.Canonical;
    percentageVBase: Length.Canonical;
  }

  export type PartialResolver = Component.PartialResolver;

  export function partiallyResolve<
    H extends Keywords.Horizontal,
    V extends Keywords.Vertical
  >(
    resolver: PartialResolver
  ): (value: Position<H, V>) => PartiallyResolved<H, V> {
    return (value) =>
      Position.of(
        Component.partiallyResolve<H>(resolver)(value.horizontal),
        Component.partiallyResolve<V>(resolver)(value.vertical)
      );
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
   *   - H/V: keyword: top | bottom | right | left | center
   *   - h/v: numeric: \<length | percentage\>
   *   - Hh/Vv: keyword (excluding center) and numeric
   *
   * Syntax:
   *
   *   - 4 tokens: Hh Vv | Vv Hh
   *   - 3 tokens: Hh V | H Vv | Vv H | V Hh
   *   - 2 tokens: H V | H v | h V | h v | V H   <- Obs! no V h | v H | v h
   *   - 1 token:  H | V | h
   */
  const mapHV = <CALC extends boolean>([horizontal, vertical]: [
    Component<Keywords.Horizontal, Unit.Length, CALC>,
    Component<Keywords.Vertical, Unit.Length, CALC>
  ]) => Position.of(horizontal, vertical);

  const mapVH = <CALC extends boolean>([vertical, horizontal]: [
    Component<Keywords.Vertical, Unit.Length, CALC>,
    Component<Keywords.Horizontal, Unit.Length, CALC>
  ]) => Position.of(horizontal, vertical);

  const {
    parseHorizontalKeywordValue,
    parseHorizontalKeyword,
    parseVerticalKeywordValue,
    parseVerticalKeyword,
  } = Side;

  const parse4 = <CALC extends boolean>(withCalculation: CALC) =>
    either(
      map(
        pair(
          parseHorizontalKeywordValue(withCalculation),
          right(
            Token.parseWhitespace,
            parseVerticalKeywordValue(withCalculation)
          )
        ),
        mapHV
      ),
      map(
        pair(
          parseVerticalKeywordValue(withCalculation),
          right(
            Token.parseWhitespace,
            parseHorizontalKeywordValue(withCalculation)
          )
        ),
        mapVH
      )
    );

  // Hh V | H Vv | Vv H | V Hh
  const parse3 = <CALC extends boolean>(withCalculation: CALC) =>
    either(
      map(
        either(
          pair(
            parseHorizontalKeywordValue(withCalculation),
            right(Token.parseWhitespace, parseVerticalKeyword(withCalculation))
          ),
          pair(
            parseHorizontalKeyword(withCalculation),
            right(
              Token.parseWhitespace,
              parseVerticalKeywordValue(withCalculation)
            )
          )
        ),
        mapHV
      ),
      map(
        either(
          pair(
            parseVerticalKeywordValue(withCalculation),
            right(
              Token.parseWhitespace,
              parseHorizontalKeyword(withCalculation)
            )
          ),
          pair(
            parseVerticalKeyword(withCalculation),
            right(
              Token.parseWhitespace,
              parseHorizontalKeywordValue(withCalculation)
            )
          )
        ),
        mapVH
      )
    );

  // H V | H v | h V | h v | V H = (H | h) (V | v) | V H
  const parse2 = <CALC extends boolean>(withCalculation: CALC) =>
    either(
      map(
        pair(
          either(
            parseHorizontalKeyword(withCalculation),
            Component.parseOffset(Keyword.of("left"), withCalculation)
          ),
          right(
            Token.parseWhitespace,
            either(
              parseVerticalKeyword(withCalculation),
              Component.parseOffset(Keyword.of("top"), withCalculation)
            )
          )
        ),
        mapHV
      ),
      map(
        pair(
          parseVerticalKeyword(withCalculation),
          right(Token.parseWhitespace, parseHorizontalKeyword(withCalculation))
        ),
        mapVH
      )
    );

  type withCalculation<CALC extends boolean> = Position<
    Keywords.Horizontal,
    Keywords.Vertical,
    Component<Keywords.Horizontal, Unit.Length, CALC>,
    Component<Keywords.Vertical, Unit.Length, CALC>,
    CALC
  >;

  // H | V | h
  const parse1 = <CALC extends boolean>(withCalculation: CALC) =>
    either(
      map(
        parseHorizontalKeyword(withCalculation),
        (horizontal) =>
          Position.of(horizontal, Keyword.of("center")) as withCalculation<CALC>
      ),
      map(
        parseVerticalKeyword(withCalculation),
        (vertical) =>
          Position.of(Keyword.of("center"), vertical) as withCalculation<CALC>
      ),
      map(
        Component.parseOffset(Keyword.of("left"), withCalculation),
        (horizontal) =>
          Position.of(horizontal, Keyword.of("center")) as withCalculation<CALC>
      )
    );

  /**
   * Parse a position, optionally accepting legacy 3-values syntax.
   *
   * {@link https://drafts.csswg.org/css-values/#typedef-position}
   * {@link https://drafts.csswg.org/css-backgrounds/#typedef-bg-position}
   *
   * @privateRemarks
   * The parsers must be tested in decreasing number of tokens.
   */
  export function parse(legacySyntax: boolean = false): CSSParser<Position> {
    return either(
      parse4(true),
      legacySyntax
        ? parse3(true)
        : () => Err.of("Three-value syntax is not allowed"),
      parse2(true),
      parse1(true)
    );
  }

  /**
   * @internal
   */
  export function parseBase(legacySyntax: boolean = false): CSSParser<Fixed> {
    return either(
      parse4(false),
      legacySyntax
        ? parse3(false)
        : () => Err.of("Three-value syntax is not allowed"),
      parse2(false),
      parse1(false)
    );
  }
}
