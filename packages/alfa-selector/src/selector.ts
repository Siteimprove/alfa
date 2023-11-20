import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import { Compound, Complex, List, Relative, Simple } from "./selector/index";

const { end, left } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#selector}
 *
 * @public
 */
export type Selector = Simple | Compound | Complex | Relative | List;

/**
 * Non-relative selectors for contexts that do not allow them
 *
 * @internal
 */
export type Absolute =
  | Simple
  | Compound
  | Complex
  | List<Simple | Compound | Complex>;

/**
 * @public
 */
export namespace Selector {
  export type JSON =
    | Serializable.ToJSON<Simple>
    | Compound.JSON
    | Complex.JSON
    | Relative.JSON
    | List.JSON;

  /**
   * Parsers for Selectors
   *
   * @remarks
   * Even simple selectors like `:is()` can include any other selector.
   * This creates circular dependencies, especially in the parsers.
   * To break it, we use dependency injection and inject the top-level
   * selector parser into each of the individual ones.
   *
   * In order to avoid an infinite recursion, this means that we must actually
   * inject a continuation wrapping the parser, and only resolve it to an
   * actual parser upon need.
   *
   * That is, the extra `()` "parameter" is needed!
   */
  function parseSelector(): CSSParser<Absolute> {
    return left(
      List.parseList(parseSelector),
      end((token) => `Unexpected token ${token}`),
    );
  }

  export const parse = parseSelector();
}
