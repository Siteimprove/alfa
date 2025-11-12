import type { Element } from "@siteimprove/alfa-dom";
import { PseudoClassSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#empty-pseudo}
 */
export class Empty extends PseudoClassSelector<"empty"> {
  public static of(): Empty {
    return new Empty();
  }

  protected constructor() {
    super("empty");
  }

  public *[Symbol.iterator](): Iterator<Empty> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element.children().isEmpty();
  }

  public toJSON(): Empty.JSON {
    return super.toJSON();
  }
}

export namespace Empty {
  export interface JSON extends PseudoClassSelector.JSON<"empty"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "empty",
    Empty.of,
  );
}
