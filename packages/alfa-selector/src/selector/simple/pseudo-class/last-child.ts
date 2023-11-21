import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#last-child-pseudo}
 */
export class LastChild extends PseudoClassSelector<"last-child"> {
  public static of(): LastChild {
    return new LastChild();
  }

  private constructor() {
    super("last-child");
  }

  public *[Symbol.iterator](): Iterator<LastChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .last()
      .includes(element);
  }

  public toJSON(): LastChild.JSON {
    return super.toJSON();
  }
}

export namespace LastChild {
  export interface JSON extends PseudoClassSelector.JSON<"last-child"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "last-child",
    LastChild.of,
  );
}
