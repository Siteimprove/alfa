import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#visited-pseudo}
 */
export class Visited extends PseudoClassSelector<"visited"> {
  public static of(): Visited {
    return new Visited();
  }

  private constructor() {
    super("visited");
  }

  public *[Symbol.iterator](): Iterator<Visited> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    switch (element.name) {
      case "a":
      case "area":
      case "link":
        return element
          .attribute("href")
          .some(() => context.hasState(element, Context.State.Visited));
    }

    return false;
  }
}
