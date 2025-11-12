import type { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context.js";
import { isLink } from "../../../common/is-link.js";

import { PseudoClassSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#visited-pseudo}
 */
export class Visited extends PseudoClassSelector<"visited"> {
  public static of(): Visited {
    return new Visited();
  }

  protected constructor() {
    super("visited");
  }

  public *[Symbol.iterator](): Iterator<Visited> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return isLink(element) && context.hasState(element, Context.State.Visited);
  }

  public toJSON(): Visited.JSON {
    return super.toJSON();
  }
}

export namespace Visited {
  export interface JSON extends PseudoClassSelector.JSON<"visited"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "visited",
    Visited.of,
  );
}
