import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context.js";
import { isLink } from "../../../common/is-link.js";

import { PseudoClassSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#link-pseudo}
 */
export class Link extends PseudoClassSelector<"link"> {
  public static of(): Link {
    return new Link();
  }

  protected constructor() {
    super("link");
  }

  public *[Symbol.iterator](): Iterator<Link> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return isLink(element) && !context.hasState(element, Context.State.Visited);
  }

  public toJSON(): Link.JSON {
    return super.toJSON();
  }
}

export namespace Link {
  export interface JSON extends PseudoClassSelector.JSON<"link"> {}

  export const parse = PseudoClassSelector.parseNonFunctional("link", Link.of);
}
