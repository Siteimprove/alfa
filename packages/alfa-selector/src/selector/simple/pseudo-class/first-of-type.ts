import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { hasName, isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#first-of-type-pseudo}
 */
export class FirstOfType extends PseudoClassSelector<"first-of-type"> {
  public static of(): FirstOfType {
    return new FirstOfType();
  }

  private constructor() {
    super("first-of-type");
  }

  public *[Symbol.iterator](): Iterator<FirstOfType> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .filter(hasName(element.name))
      .first()
      .includes(element);
  }

  public toJSON(): FirstOfType.JSON {
    return super.toJSON();
  }
}

export namespace FirstOfType {
  export interface JSON extends PseudoClassSelector.JSON<"first-of-type"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "first-of-type",
    FirstOfType.of,
  );
}
