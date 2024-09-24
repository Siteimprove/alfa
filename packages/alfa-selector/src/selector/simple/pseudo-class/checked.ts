import { Element } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";

import { PseudoClassSelector } from "./pseudo-class.js";

const { hasAttribute, hasInputType, hasName } = Element;
const { and, or } = Refinement;

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

  public matches = or(
    and(
      hasName("input"),
      hasInputType("checkbox", "radio"),
      hasAttribute("checked"),
    ),

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
