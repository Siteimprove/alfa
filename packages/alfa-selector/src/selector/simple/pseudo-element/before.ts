import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo/#selectordef-before}
 */
export class Before extends PseudoElementSelector<"before"> {
  public static of(): Before {
    return new Before();
  }

  private constructor() {
    super("before");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Before> {
    yield this;
  }
}

export namespace Before {
  export const parse = PseudoElementSelector.parseLegacy("before", Before.of);
}
