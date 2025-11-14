import { Array } from "@siteimprove/alfa-array";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import {
  Function,
  Lexer,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";

import {
  type Angle,
  type Length,
  Number,
  type Numeric,
  Percentage,
} from "../numeric/index.js";
import { Keyword } from "../textual/index.js";
import { Format } from "./format.js";

const { pair, map, either, option, right, take, delimited } = Parser;

/**
 * Format for colors defined by a functional triplet with an optional alpha
 * channel.
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

  // Pre-lex all possible 0s once.
  const lexed0 = ["0", "0%", "0deg", "0px"].map(Lexer.lex);

  // Make a parsed 0 of the correct type. Length always accept raw 0s as 0px, but
  // Angle and Percentage do not in general, but often do in colors (this is then
  // handled in the component parser).
  const make0 = <C extends Angle | Length | Number | Percentage>(
    parser: CSSParser<C>,
  ) => Array.collectFirst(lexed0, (value) => parser(value).ok()).getUnsafe()[1];

  /**
   * Parses either a component or the keyword "none", reduces "none" to
   * the correct type, or fails if it is not allowed.
   *
   * todo: no export?
   */
  export const parseComponent = <
    C extends Angle | Length | Number | Percentage,
  >(
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
   * Parses an optional alpha component, preceded by the given delimiter, possibly
   * accepting "none" as a value.
   */
  const alphaParser = (
    delimiter: CSSParser<any>,
    legacy: boolean = false,
  ): CSSParser<Number | Percentage<"percentage">> =>
    map(
      option(
        right(
          delimited(option(Token.parseWhitespace), delimiter),
          parseComponent(
            either(Number.parse, Percentage.parse<"percentage">),
            legacy,
          ),
        ),
      ),
      (alpha) => alpha.getOrElse(() => Number.of(1)),
    );

  /**
   * Parses an optional alpha component, preceded by a '/' delimiter.
   */
  // todo: no export?
  export const parseAlpha = alphaParser(Token.parseDelim("/"));

  /**
   * Parses an optional alpha component in legacy syntax: "none" is forbidden,
   * and separator is a comma.
   */
  // todo: no export?
  export const parseAlphaLegacy = alphaParser(Token.parseComma, true);

  // const
}
