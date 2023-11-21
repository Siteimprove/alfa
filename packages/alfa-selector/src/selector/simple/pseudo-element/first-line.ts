import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-line-pseudo}
 */
export class FirstLine extends PseudoElementSelector<"first-line"> {
  public static of(): FirstLine {
    return new FirstLine();
  }

  private constructor() {
    super("first-line");
  }

  public *[Symbol.iterator](): Iterator<FirstLine> {
    yield this;
  }
}
