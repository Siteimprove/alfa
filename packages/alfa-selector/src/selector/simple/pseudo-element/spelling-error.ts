import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-spelling-error}
 */
export class SpellingError extends PseudoElementSelector<"spelling-error"> {
  public static of(): SpellingError {
    return new SpellingError();
  }

  private constructor() {
    super("spelling-error");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<SpellingError> {
    yield this;
  }
}

export namespace SpellingError {
  export const parse = PseudoElementSelector.parseNonLegacy(
    "spelling-error",
    SpellingError.of,
  );
}
