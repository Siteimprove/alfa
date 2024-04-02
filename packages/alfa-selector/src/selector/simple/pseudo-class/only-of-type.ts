import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { hasName, isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#only-of-type-pseudo}
 */
export class OnlyOfType extends PseudoClassSelector<"only-of-type"> {
  public static of(): OnlyOfType {
    return new OnlyOfType();
  }

  private constructor() {
    super("only-of-type");
  }

  public *[Symbol.iterator](): Iterator<OnlyOfType> {
    yield this;
  }

  public matches(element: Element): boolean {
    return (
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter(hasName(element.name)).size === 1
    );
  }

  public toJSON(): OnlyOfType.JSON {
    return super.toJSON();
  }
}

export namespace OnlyOfType {
  export interface JSON extends PseudoClassSelector.JSON<"only-of-type"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "only-of-type",
    OnlyOfType.of,
  );
}
