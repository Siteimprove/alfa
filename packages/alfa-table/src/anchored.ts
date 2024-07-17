import type { Comparable, Comparison } from "@siteimprove/alfa-comparable";

import type { Slot } from "./slot.js";

/**
 * @internal
 */
export interface Anchored extends Comparable<Anchored> {
  readonly anchor: Slot;
}

/**
 * @internal
 */
export namespace Anchored {
  export function compare(a: Anchored, b: Anchored): Comparison {
    return a.anchor.compare(b.anchor);
  }

  export function equals(a: Anchored, b: Anchored): boolean {
    return a.anchor.equals(b.anchor);
  }
}
