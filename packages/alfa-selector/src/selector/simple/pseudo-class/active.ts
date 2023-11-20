import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#active-pseudo}
 */
export class Active extends PseudoClassSelector<"active"> {
  public static of(): Active {
    return new Active();
  }

  private constructor() {
    super("active");
  }

  public *[Symbol.iterator](): Iterator<Active> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return context.isActive(element);
  }
}