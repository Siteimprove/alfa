import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context.js";

import { PseudoClassSelector } from "./pseudo-class.js";

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

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return context.isActive(element);
  }

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
