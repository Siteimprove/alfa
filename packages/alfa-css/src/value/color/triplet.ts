import { Array } from "@siteimprove/alfa-array";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";

import { Lexer, type Parser as CSSParser, Token } from "../../syntax/index.js";

import {
  type Angle,
  type Length,
  Number,
  Percentage,
} from "../numeric/index.js";
import { Keyword } from "../textual/index.js";
import { Format } from "./format.js";

const { array, pair, map, either, option, right, delimited } = Parser;

/**
 * Format for colors defined by a functional triplet with an optional alpha
 * channel, e.g. RGB, HSL, …
 *
 * @internal
 */
export abstract class Triplet<
  F extends string = string,
  A extends Number.Canonical | Percentage.Canonical =
    | Number.Canonical
    | Percentage.Canonical,
> extends Format<F> {
  protected readonly _alpha: A;

  protected constructor(format: F, alpha: A) {
    super(format);

    this._alpha = alpha;
  }

  public get alpha(): A {
    return this._alpha;
  }

  public toJSON(): Triplet.JSON<F> {
    return {
      ...super.toJSON(),
      alpha: this._alpha.toJSON(),
    };
  }
}

/**
 * @internal
 */
export namespace Triplet {
  export interface JSON<F extends string = string> extends Format.JSON<F> {
    alpha: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  type Component = Angle | Length | Number | Percentage;

  // Pre-lex all possible 0s once.
  const lexed0 = ["0", "0%", "0deg", "0px"].map(Lexer.lex);

  // Make a parsed 0 of the correct type. Length always accept raw 0s as 0px, but
  // Angle and Percentage do not in general, but often do in colors (this is then
  // handled in the component parser).
  const make0 = <C extends Component>(parser: CSSParser<C>) =>
    Array.collectFirst(lexed0, (value) => parser(value).ok())
      // The parser will parse at least one of the 0s since these are all the 0
      // for the allowed component types.
      .getUnsafe()[1];

  /**
   * Parses either a component or the keyword "none", reduces "none" to
   * the correct type, or fails if it is not allowed.
   *
   */
  const parseComponent = <C extends Component>(
    parser: CSSParser<C>,
    // In legacy mode, "none" is not accepted.
    legacy: boolean = false,
  ): CSSParser<C> =>
    either(
      parser,
      legacy
        ? () => Err.of("none is not accepted in legacy color syntax")
        : map(Keyword.parse("none"), () => make0(parser)),
    );

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-alpha-value}
   */
  const parseAlphaValue = either(Number.parse, Percentage.parse<"percentage">);

  /**
   * Parses the delimiter for Alpha value, "," or "/" depending on legacy mode.
   */
  const parseAlphaDelim = (legacy: boolean): CSSParser<any> =>
    legacy ? Token.parseComma : Token.parseDelim("/");

  /**
   * Parses an optional alpha component, preceded by the correct delimiter, possibly
   * accepting "none" as a value.
   */
  const parseAlpha = (
    legacy: boolean = false,
  ): CSSParser<Number | Percentage<"percentage">> =>
    map(
      option(
        right(
          delimited(option(Token.parseWhitespace), parseAlphaDelim(legacy)),
          parseComponent(parseAlphaValue, legacy),
        ),
      ),
      (alpha) => alpha.getOrElse(() => Number.of(1)),
    );

  /**
   * Parses the separator between components, "," in legacy mode, whitespace
   * otherwise.
   */
  const parseSeparator = (legacy: boolean): CSSParser<any> =>
    legacy
      ? delimited(option(Token.parseWhitespace), Token.parseComma)
      : option(Token.parseWhitespace);

  /**
   * Parses 3 different colors components.
   *
   * @internal
   */
  export function parseTriplet<
    C1 extends Component,
    C2 extends Component,
    C3 extends Component,
  >(
    [parser1, parser2, parser3]: [CSSParser<C1>, CSSParser<C2>, CSSParser<C3>],
    legacy?: boolean,
  ): CSSParser<[C1, C2, C3, Number | Percentage<"percentage">]>;

  /**
   * Parses 3 colors components of two kinds (A, B, B).
   *
   * @internal
   */
  export function parseTriplet<C1 extends Component, C2 extends Component>(
    [parser1, parser2]: [CSSParser<C1>, CSSParser<C2>],
    legacy?: boolean,
  ): CSSParser<[C1, C2, C2, Number | Percentage<"percentage">]>;

  /**
   * Parses 3 colors components of the same kind.
   *
   * @internal
   */
  export function parseTriplet<C extends Component>(
    [parser]: [CSSParser<C>],
    legacy?: boolean,
  ): CSSParser<[C, C, C, Number | Percentage<"percentage">]>;

  /**
   * Parses a triplet of values and an optional alpha channel.
   *
   * @privateRemarks
   * This cannot be called simply `parse` as it would clash with the `parse`
   * in the inherited classes.
   *
   * @internal
   */
  export function parseTriplet<
    C1 extends Component,
    C2 extends Component,
    C3 extends Component,
  >(
    parsers: Array<CSSParser<C1 | C2 | C3>>,
    legacy: boolean = false,
  ): CSSParser<
    [
      C1 | C2 | C3,
      C1 | C2 | C3,
      C1 | C2 | C3,
      Number | Percentage<"percentage">,
    ]
  > {
    const [parser1, parser2 = parser1, parser3 = parser2] = parsers;

    const parser: CSSParser<[C1 | C2 | C3, C1 | C2 | C3, C1 | C2 | C3]> = array(
      parseSeparator(legacy),
      parseComponent(parser1, legacy),
      parseComponent(parser2, legacy),
      parseComponent(parser3, legacy),
    );

    return map(pair(parser, parseAlpha(legacy)), ([[a, b, c], alpha]) => [
      a,
      b,
      c,
      alpha,
    ]);
  }
}
