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
  export import Pseudo = Selectors.Pseudo;
  export import Type = Selectors.Type;

  export import JSON = Selectors.Selector.JSON;

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
