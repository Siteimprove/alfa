import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Complex } from "./complex";
import { Compound } from "./compound";
import { List } from "./list";
import type { Relative } from "./relative";
import type { Simple } from "./simple/index";
import { Host } from "./simple/pseudo-class/host";
import { HostContext } from "./simple/pseudo-class/host-context";
import { Slotted } from "./simple/pseudo-element/slotted";

// Re-export for further users
export * from "./combinator";
export * from "./complex";
export * from "./compound";
export * from "./list";
export * from "./relative";
export * from "./simple";

const { end, left, map } = Parser;
const { and, or, test } = Refinement;

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
   * Whether a selector targets slotted elements (living in another tree).
   *
   * @remarks
   * `::slotted` inside a complex selector, not in rightmost position,
   * does not match anything. Complex.matches currently let it match stuff,
   * but hasSlotted should make sure we never call it that way…
   */
  export function hasSlotted(selector: Selector): boolean {
    return test(
      or(
        Slotted.isSlotted,
        and(Compound.isCompound, (compound) =>
          Iterable.some(compound.selectors, Slotted.isSlotted),
        ),
        // `::slotted` only works in the rightmost position of complex selectors.
        and(Complex.isComplex, (complex) => hasSlotted(complex.right)),
      ),
      selector,
    );
  }

  /**
   * Whether a selector targets the shadow host of its tree (hence in another tree).
   *
   * @remarks
   * * `:host` and `:context` as part of a compound selector never match.
   * * `:host` and `:host-context` as the leftmost part of a complex selector
   *   actually match a node within the shadow tree. Thus, they are not
   *   considered as "host selector" and Complex.matches handles the case.
   * * `:host` and `:host-context` in other place of a complex selector do
   *   not match anything.
   */
  export const isHostSelector = or(Host.isHost, HostContext.isHostContext);

  /**
   * Whether a selector is a shadow selector selecting a light node (in another tree).
   *
   */
  export const isShadow = or(isHostSelector, hasSlotted);

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
      map(List.parseList(parseSelector), (list) =>
        list.length === 1 ? Iterable.first(list.selectors).getUnsafe() : list,
      ),
      end((token) => `Unexpected token ${token}`),
    );
  }

  export const parse = parseSelector();
}
