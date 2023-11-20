import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#only-child-pseudo}
 */
export class OnlyChild extends PseudoClassSelector<"only-child"> {
  public static of(): OnlyChild {
    return new OnlyChild();
  }

  private constructor() {
    super("only-child");
  }

  public *[Symbol.iterator](): Iterator<OnlyChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element.inclusiveSiblings().filter(isElement).size === 1;
  }
}
