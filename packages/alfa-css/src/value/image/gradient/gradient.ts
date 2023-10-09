import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { type Parser as CSSParser } from "../../../syntax";

import * as hint from "./item/hint";
import * as item from "./item/item";
import * as linear from "./linear/linear";
import * as radial from "./radial/radial";
import * as stop from "./item/stop";

const { either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#gradients}
 *
 * @public
 */
export type Gradient = Gradient.Linear | Gradient.Radial;

/**
 * @public
 */
export namespace Gradient {
  export type Canonical = Linear.Canonical | Radial.Canonical;

  export type JSON = Linear.JSON | Radial.JSON;

  export import Hint = hint.Hint;

  export import Item = item.Item;

  export import Linear = linear.Linear;
  export import Radial = radial.Radial;
  export import Stop = stop.Stop;

  export type Resolver = Linear.Resolver & Radial.Resolver;

  export type PartiallyResolved =
    | Linear.PartiallyResolved
    | Radial.PartiallyResolved;

  export type PartialResolver = Linear.PartialResolver & Radial.PartialResolver;

  export function partiallyResolve(
    resolver: PartialResolver
  ): (value: Gradient) => PartiallyResolved {
    return (value) =>
      Selective.of(value)
        .if(Linear.isLinear, Linear.partiallyResolve(resolver))
        .else(Radial.partiallyResolve(resolver))
        .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-gradient}
   */
  export const parse: CSSParser<Gradient> = either(
    Linear.parse(Item.parseList),
    Radial.parse(Item.parseList)
  );
}
