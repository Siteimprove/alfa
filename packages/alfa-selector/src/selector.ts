import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import * as Selectors from "./selector/index";

const { end, left } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#selector}
 *
 * @public
 */
export type Selector =
  | Selector.Simple
  | Selector.Compound
  | Selector.Complex
  | Selector.Relative
  | Selector.List;

/**
 * @public
 */
export namespace Selector {
  export import Combinator = Selectors.Combinator;
  export import Complex = Selectors.Complex;
  export import Compound = Selectors.Compound;
  export import List = Selectors.List;
  export import Relative = Selectors.Relative;
  export import Simple = Selectors.Simple;

  export import Attribute = Selectors.Attribute;
  export import Class = Selectors.Class;
  export import Id = Selectors.Id;
  export import PseudoClass = Selectors.PseudoClass;
  export import PseudoElement = Selectors.PseudoElement;
  export import Type = Selectors.Type;

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
   * This creates circular dependencies, especially in the parser.
   * To break it, we use dependency injection and inject the top-level
   * selector into each of the individual ones.
   *
   * In order to avoid an infinite recursion, this means that we must actually
   * inject a continuation wrapping the parser, and only resolve it to an
   * actual parser upon need.
   *
   * That is, the extra `()` "parameter" is needed!
   */
  function parseSelector(): CSSParser<
    Simple | Compound | Complex | List<Simple | Compound | Complex>
  > {
    return left(
      List.parseList(parseSelector),
      end((token) => `Unexpected token ${token}`),
    );
  }

  export const parse = parseSelector();
}
