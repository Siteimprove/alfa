import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import { Keyword } from "../textual/keyword.js";
import type { Length } from "../numeric/index.js";
import type { PartiallyResolvable, Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

import * as component from "./component.js";
import * as keywords from "./keywords.js";
import * as side from "./side.js";

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
  >
  extends Value<"position", Value.HasCalculation<[HC, VC]>>
  implements
    Resolvable<Position.Canonical<H, V>, Position.Resolver>,
    PartiallyResolvable<
      Position.PartiallyResolved<H, V>,
      Position.PartialResolver
    >
{
  public static of<
    H extends Position.Keywords.Horizontal = Position.Keywords.Horizontal,
    V extends Position.Keywords.Vertical = Position.Keywords.Vertical,
    HC extends Position.Component<H> = Position.Component<H>,
    VC extends Position.Component<V> = Position.Component<V>,
  >(horizontal: HC, vertical: VC): Position<H, V, HC, VC> {
    return new Position(horizontal, vertical);
  }

  private readonly _horizontal: HC;
  private readonly _vertical: VC;

  protected constructor(horizontal: HC, vertical: VC) {
    super("position", Value.hasCalculation(horizontal, vertical));
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
    );
  }

  public partiallyResolve(
    resolver: Position.PartialResolver,
  ): Position.PartiallyResolved<H, V> {
    return new Position(
      Position.Component.partiallyResolve<H>(resolver)(this._horizontal),
      Position.Component.partiallyResolve<V>(resolver)(this._vertical),
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
    V extends Keywords.Vertical = Keywords.Vertical,
  > = Position<H, V, Component.Canonical<H>, Component.Canonical<V>>;

  export type PartiallyResolved<
    H extends Keywords.Horizontal = Keywords.Horizontal,
    V extends Keywords.Vertical = Keywords.Vertical,
  > = Position<
    H,
    V,
    Component.PartiallyResolved<H>,
    Component.PartiallyResolved<V>
  >;

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
  const mapHV = ([horizontal, vertical]: [
    Component<Keywords.Horizontal>,
    Component<Keywords.Vertical>,
  ]) => Position.of(horizontal, vertical);

  const mapVH = ([vertical, horizontal]: [
    Component<Keywords.Vertical>,
    Component<Keywords.Horizontal>,
  ]) => Position.of(horizontal, vertical);

  const {
    parseHorizontalKeywordValue,
    parseHorizontalKeyword,
    parseVerticalKeywordValue,
    parseVerticalKeyword,
  } = Side;

  const parse4 = either(
    map(
      pair(
        parseHorizontalKeywordValue,
        right(Token.parseWhitespace, parseVerticalKeywordValue),
      ),
      mapHV,
    ),
    map(
      pair(
        parseVerticalKeywordValue,
        right(Token.parseWhitespace, parseHorizontalKeywordValue),
      ),
      mapVH,
    ),
  );

  // Hh V | H Vv | Vv H | V Hh
  const parse3 = either(
    map(
      either(
        pair(
          parseHorizontalKeywordValue,
          right(Token.parseWhitespace, parseVerticalKeyword),
        ),
        pair(
          parseHorizontalKeyword,
          right(Token.parseWhitespace, parseVerticalKeywordValue),
        ),
      ),
      mapHV,
    ),
    map(
      either(
        pair(
          parseVerticalKeywordValue,
          right(Token.parseWhitespace, parseHorizontalKeyword),
        ),
        pair(
          parseVerticalKeyword,
          right(Token.parseWhitespace, parseHorizontalKeywordValue),
        ),
      ),
      mapVH,
    ),
  );

  // H V | H v | h V | h v | V H = (H | h) (V | v) | V H
  const parse2 = either(
    map(
      pair(
        either(
          parseHorizontalKeyword,
          Component.parseOffset(Keyword.of("left")),
        ),
        right(
          Token.parseWhitespace,
          either(
            parseVerticalKeyword,
            Component.parseOffset(Keyword.of("top")),
          ),
        ),
      ),
      mapHV,
    ),
    map(
      pair(
        parseVerticalKeyword,
        right(Token.parseWhitespace, parseHorizontalKeyword),
      ),
      mapVH,
    ),
  );

  // H | V | h
  const parse1 = either<Slice<Token>, Position, string>(
    map(parseHorizontalKeyword, (horizontal) =>
      Position.of(horizontal, Keyword.of("center")),
    ),
    map(parseVerticalKeyword, (vertical) =>
      Position.of(Keyword.of("center"), vertical),
    ),
    map(Component.parseOffset(Keyword.of("left")), (horizontal) =>
      Position.of(horizontal, Keyword.of("center")),
    ),
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
      parse4,
      legacySyntax ? parse3 : () => Err.of("Three-value syntax is not allowed"),
      parse2,
      parse1,
    );
  }
}
