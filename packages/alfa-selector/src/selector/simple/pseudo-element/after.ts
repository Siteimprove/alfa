import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo/#selectordef-after}
 */
export class After extends PseudoElementSelector<"after"> {
  public static of(): After {
    return new After();
  }
  private constructor() {
    super("after");
  }

  public *[Symbol.iterator](): Iterator<After> {
    yield this;
  }
}

export namespace After {
  export const parse = PseudoElementSelector.parseLegacy("after", After.of);
}
