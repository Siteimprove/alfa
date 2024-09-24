import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { PseudoClassSelector } from "./pseudo-class.js";

const { hasAttribute, hasInputType, hasName } = Element;
const { and, or } = Predicate;

/**
 * {@link https://drafts.csswg.org/selectors/#checked}
 */
export class Checked extends PseudoClassSelector<"checked"> {
  public static of(): Checked {
    return new Checked();
  }

  private constructor() {
    super("checked");
  }

  public *[Symbol.iterator](): Iterator<Checked> {
    yield this;
  }

  /**
   * @privateRemarks
   * Checkedness and selectedness can change during the lifecycle of an element,
   * but we do not have access to that. We rely on the content attributes being
   * correctly set in the snapshot we test.
   */
  public matches = or(
    and(hasInputType("checkbox", "radio"), hasAttribute("checked")),
    and(hasName("option"), hasAttribute("selected")),
  );

  public toJSON(): Checked.JSON {
    return super.toJSON();
  }
}

export namespace Checked {
  export interface JSON extends PseudoClassSelector.JSON<"checked"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "checked",
    Checked.of,
  );
}
