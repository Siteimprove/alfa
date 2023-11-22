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

  /** @public (knip) */
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

  public toJSON(): Link.JSON {
    return super.toJSON();
  }
}

export namespace Link {
  export interface JSON extends PseudoClassSelector.JSON<"link"> {}

  export const parse = PseudoClassSelector.parseNonFunctional("link", Link.of);
}
