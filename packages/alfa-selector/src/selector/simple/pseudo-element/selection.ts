import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-selection}
 */
export class Selection extends PseudoElementSelector<"selection"> {
  public static of(): Selection {
    return new Selection();
  }

  private constructor() {
    super("selection");
  }

  public *[Symbol.iterator](): Iterator<Selection> {
    yield this;
  }
}

export namespace Selection {
  export const parse = PseudoElementSelector.parseNonLegacy(
    "selection",
    Selection.of,
  );
}
