import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#link-pseudo}
 */
export class Link extends PseudoClassSelector<"link"> {
  public static of(): Link {
    return new Link();
  }

  private constructor() {
    super("link");
  }

  public *[Symbol.iterator](): Iterator<Link> {
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
          .some(() => !context.hasState(element, Context.State.Visited));
    }

    return false;
  }
}
