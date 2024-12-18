import { PseudoElementSelector } from "./pseudo-element.js";

/**
 *{@link https://drafts.csswg.org/css-pseudo-4/#file-selector-button-pseudo}
 */
export class FileSelectorButton extends PseudoElementSelector<"file-selector-button"> {
  public static of(): FileSelectorButton {
    return new FileSelectorButton();
  }

  protected constructor() {
    super("file-selector-button");
  }

  public *[Symbol.iterator](): Iterator<FileSelectorButton> {
    yield this;
  }
}

export namespace FileSelectorButton {
  export const parse = PseudoElementSelector.parseNonLegacy(
    "file-selector-button",
    FileSelectorButton.of,
  );
}
