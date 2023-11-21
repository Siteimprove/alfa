import { PseudoElementSelector } from "./pseudo-element";

/**
 *{@link https://drafts.csswg.org/css-pseudo-4/#file-selector-button-pseudo}
 */
export class FileSelectorButton extends PseudoElementSelector<"file-selector-button"> {
  public static of(): FileSelectorButton {
    return new FileSelectorButton();
  }

  private constructor() {
    super("file-selector-button");
  }

  public *[Symbol.iterator](): Iterator<FileSelectorButton> {
    yield this;
  }
}
