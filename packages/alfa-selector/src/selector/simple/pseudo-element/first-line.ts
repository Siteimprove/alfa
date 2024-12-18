import { PseudoElementSelector } from "./pseudo-element.js";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-line-pseudo}
 */
export class FirstLine extends PseudoElementSelector<"first-line"> {
  public static of(): FirstLine {
    return new FirstLine();
  }

  protected constructor() {
    super("first-line");
  }

  public *[Symbol.iterator](): Iterator<FirstLine> {
    yield this;
  }
}

export namespace FirstLine {
  export const parse = PseudoElementSelector.parseLegacy(
    "first-line",
    FirstLine.of,
  );
}
