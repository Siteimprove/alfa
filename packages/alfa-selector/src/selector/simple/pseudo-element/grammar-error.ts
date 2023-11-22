import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-grammar-error}
 */
export class GrammarError extends PseudoElementSelector<"grammar-error"> {
  public static of(): GrammarError {
    return new GrammarError();
  }

  private constructor() {
    super("grammar-error");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<GrammarError> {
    yield this;
  }
}

export namespace GrammarError {
  export const parse = PseudoElementSelector.parseNonLegacy(
    "grammar-error",
    GrammarError.of,
  );
}
