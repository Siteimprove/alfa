import { Element } from "@siteimprove/alfa-dom";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#enableddisabled}
 * {@link https://html.spec.whatwg.org/multipage#selector-disabled}
 */
export class Disabled extends PseudoClassSelector<"disabled"> {
  public static of(): Disabled {
    return new Disabled();
  }

  private constructor() {
    super("disabled");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Disabled> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return Element.isActuallyDisabled(element);
  }

  public toJSON(): Disabled.JSON {
    return super.toJSON();
  }
}

export namespace Disabled {
  export interface JSON extends PseudoClassSelector.JSON<"disabled"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "disabled",
    Disabled.of,
  );
}
