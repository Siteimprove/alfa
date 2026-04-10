import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context.ts";

import { PseudoClassSelector } from "./pseudo-class.ts";

/**
 * {@link https://drafts.csswg.org/selectors/#focus-pseudo}
 */
export class Focus extends PseudoClassSelector<"focus"> {
  public static of(): Focus {
    return new Focus();
  }

  protected constructor() {
    super("focus", true);
  }

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
