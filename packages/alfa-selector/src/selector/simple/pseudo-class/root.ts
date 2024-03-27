import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { PseudoClassSelector } from "./pseudo-class";

const { isElement } = Element;
const { not } = Predicate;

/**
 * {@link https://drafts.csswg.org/selectors/#root-pseudo}
 */
export class Root extends PseudoClassSelector<"root"> {
  public static of(): Root {
    return new Root();
  }

  private constructor() {
    super("root");
  }

  public *[Symbol.iterator](): Iterator<Root> {
    yield this;
  }

  public matches(element: Element): boolean {
    // The root element is the element whose parent is NOT itself an element.
    return element.parent().every(not(isElement));
  }

  public toJSON(): Root.JSON {
    return super.toJSON();
  }
}

export namespace Root {
  export interface JSON extends PseudoClassSelector.JSON<"root"> {}

  export const parse = PseudoClassSelector.parseNonFunctional("root", Root.of);
}
