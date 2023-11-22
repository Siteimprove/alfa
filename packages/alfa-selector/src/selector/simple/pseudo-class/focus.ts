import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#focus-pseudo}
 */
export class Focus extends PseudoClassSelector<"focus"> {
  public static of(): Focus {
    return new Focus();
  }

  private constructor() {
    super("focus");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Focus> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return context.isFocused(element);
  }

  public toJSON(): Focus.JSON {
    return super.toJSON();
  }
}

export namespace Focus {
  export interface JSON extends PseudoClassSelector.JSON<"focus"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "focus",
    Focus.of,
  );
}
