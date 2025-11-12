import type { Element } from "@siteimprove/alfa-dom";

import { isLink } from "../../../common/is-link.js";

import { PseudoClassSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#link-pseudo}
 */
export class AnyLink extends PseudoClassSelector<"any-link"> {
  public static of(): AnyLink {
    return new AnyLink();
  }

  protected constructor() {
    super("any-link");
  }

  public *[Symbol.iterator](): Iterator<AnyLink> {
    yield this;
  }

  public matches(element: Element): boolean {
    return isLink(element);
  }

  public toJSON(): AnyLink.JSON {
    return super.toJSON();
  }
}

export namespace AnyLink {
  export interface JSON extends PseudoClassSelector.JSON<"any-link"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "any-link",
    AnyLink.of,
  );
}
