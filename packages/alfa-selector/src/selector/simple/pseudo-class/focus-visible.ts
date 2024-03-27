import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#the-focus-visible-pseudo}
 */
export class FocusVisible extends PseudoClassSelector<"focus-visible"> {
  public static of(): FocusVisible {
    return new FocusVisible();
  }

  private constructor() {
    super("focus-visible");
  }

  public *[Symbol.iterator](): Iterator<FocusVisible> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    // :focus-visible matches elements that are focused and where UA decides
    // focus should be shown. That is notably text fields and keyboard-focused
    // elements (some UA don't show focus indicator on mouse-focused elements)
    // For the purposes of accessibility testing, we currently assume that
    // we always want to look at a mode where the focus is visible. This is
    // notably due to the fact that it is a UA decision, and therefore not
    // a problem for the authors to fix if done incorrectly.
    return context.isFocused(element);
  }
}

export namespace FocusVisible {
  export interface JSON extends PseudoClassSelector.JSON<"focus-visible"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "focus-visible",
    FocusVisible.of,
  );
}
