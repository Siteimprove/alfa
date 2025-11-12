import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class.js";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#first-child-pseudo}
 */
export class FirstChild extends PseudoClassSelector<"first-child"> {
  public static of(): FirstChild {
    return new FirstChild();
  }

  protected constructor() {
    super("first-child");
  }

  public *[Symbol.iterator](): Iterator<FirstChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .first()
      .includes(element);
  }

  public toJSON(): FirstChild.JSON {
    return super.toJSON();
  }
}

export namespace FirstChild {
  export interface JSON extends PseudoClassSelector.JSON<"first-child"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "first-child",
    FirstChild.of,
  );
}
