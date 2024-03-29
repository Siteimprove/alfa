import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-target-text}
 */
export class TargetText extends PseudoElementSelector<"target-text"> {
  public static of(): TargetText {
    return new TargetText();
  }

  private constructor() {
    super("target-text");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<TargetText> {
    yield this;
  }
}

export namespace TargetText {
  export const parse = PseudoElementSelector.parseNonLegacy(
    "target-text",
    TargetText.of,
  );
}
