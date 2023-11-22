import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-letter-pseudo}
 */
export class FirstLetter extends PseudoElementSelector<"first-letter"> {
  public static of(): FirstLetter {
    return new FirstLetter();
  }

  private constructor() {
    super("first-letter");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<FirstLetter> {
    yield this;
  }
}

export namespace FirstLetter {
  export const parse = PseudoElementSelector.parseLegacy(
    "first-letter",
    FirstLetter.of,
  );
}
