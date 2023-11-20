import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

// Import the various selectors for use in that file.
import { Complex } from "./complex";
import { Compound } from "./compound";
import { List } from "./list";
import { Relative } from "./relative";
import { Simple } from "./simple";

// Re-export the various selectors for other use.
export * from "./combinator";
export * from "./complex";
export * from "./compound";
export * from "./list";
export * from "./relative";
export * from "./simple";

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
 * @internal
 */
export namespace Absolute {
  export type JSON =
    | Simple.JSON
    | Compound.JSON
    | Complex.JSON
    | List.JSON<Simple | Compound | Complex>;
}

/**
 * @public
 */
export namespace Selector {
  export type JSON =
    | Simple.JSON
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
