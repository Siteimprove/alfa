import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { hasName, isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#last-of-type-pseudo}
 */
export class LastOfType extends PseudoClassSelector<"last-of-type"> {
  public static of(): LastOfType {
    return new LastOfType();
  }

  private constructor() {
    super("last-of-type");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<LastOfType> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .filter(hasName(element.name))
      .last()
      .includes(element);
  }

  public toJSON(): LastOfType.JSON {
    return super.toJSON();
  }
}

export namespace LastOfType {
  export interface JSON extends PseudoClassSelector.JSON<"last-of-type"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "last-of-type",
    LastOfType.of,
  );
}
