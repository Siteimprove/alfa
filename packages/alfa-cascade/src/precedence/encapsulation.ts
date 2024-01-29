import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";

/**
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-context}
 *
 * @remarks
 * This is called "context" in CSS, sub-called "encapsulation context".
 * We already have a `Context` type for hover/focus/…, so we call this
 * `Encapsulation` instead.
 *
 * While nesting document trees builds a tree, no element may own more than
 * one shadow tree. Selectors matching an element can come from the style sheets of:
 * * its own document;
 * * its shadow tree (`:host` selectors);
 * * the shadow tree of its parent (`::slotted` selectors).
 * In the case of a slotted element being itself an host, the nesting is pretty clear.
 * (light > shadow of the parent slotting the element > shadow of the slotted element).
 *
 * Therefore, for any given element, it is not needed to keep track of the full tree
 * structure of the encapsulation contexts. The encapsulation depth is enough.
 *
 * To account for important declarations being compared the other way around,
 * we use a negative value for normal declarations, and a positive value for important.
 * Thus, the higher encapsulations are the deep important ones, and the lower ones
 * are the deep normal ones. Comparison stays simple number comparison.
 *
 * @public
 */
export type Encapsulation = number;

/**
 * @public
 */
export namespace Encapsulation {
  export type JSON = Encapsulation;

  export const compare: Comparer<Encapsulation> = Comparable.compareNumber;
}
