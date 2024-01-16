import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";

/**
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-context}
 *
 * @remarks
 * This is called "context" in CSS, sub-called "encapsulation context".
 * We already have a `Context` type for hover/focus/…, so we call this
 * `Encapsulation` instead.
 *
 * This enumeration mixes both Encapsulation and importance because importance
 * reverses the comparison of encapsulation in cascade sorting.
 * Mixing both here allows for the comparison to be simple number comparison,
 * which should be faster than looking at more than one field.
 *
 * Cascading encapsulation are defined in ascending order; encapsulations defined
 * first have lower precedence than encapsulations defined later. Thus, an
 * encapsulation with higher value takes precedence over one with lower value.
 * This means that comparing encapsulations is the same as comparing numbers.
 *
 * @privateRemarks
 * It seems that it is never possible to pierce through several levels of shadow.
 * Hence, it is sufficient to record whether the declaration comes from a shadow
 * tree, without caring about the encapsulation depth.
 *
 * @public
 */
export enum Encapsulation {
  NormalInner = 1,
  NormalOuter = 2,
  ImportantOuter = 3,
  ImportantInner = 4,
}

/**
 * @public
 */
export namespace Encapsulation {
  export type JSON = Encapsulation;

  export const compare: Comparer<Encapsulation> = Comparable.compareNumber;
}
