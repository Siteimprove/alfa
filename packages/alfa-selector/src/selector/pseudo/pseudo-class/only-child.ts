import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class.js";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#only-child-pseudo}
 */
export class OnlyChild extends PseudoClassSelector<"only-child"> {
  public static of(): OnlyChild {
    return new OnlyChild();
  }

  protected constructor() {
    super("only-child", false);
  }

  public *[Symbol.iterator](): Iterator<OnlyChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element.inclusiveSiblings().filter(isElement).size === 1;
  }

  public toJSON(): OnlyChild.JSON {
    return super.toJSON();
  }
}

export namespace OnlyChild {
  export interface JSON extends PseudoClassSelector.JSON<"only-child"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "only-child",
    OnlyChild.of,
  );
}
