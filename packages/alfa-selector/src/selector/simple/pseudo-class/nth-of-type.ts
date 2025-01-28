import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";

import { WithIndex } from "./pseudo-class.js";

const { hasName, isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-of-type-pseudo}
 */
export class NthOfType extends WithIndex<"nth-of-type"> {
  public static of(index: Nth): NthOfType {
    return new NthOfType(index);
  }

  protected constructor(index: Nth) {
    super("nth-of-type", index);
  }

  public *[Symbol.iterator](): Iterator<NthOfType> {
    yield this;
  }

  public matches(element: Element): boolean {
    const indices = NthOfType._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter(hasName(element.name))
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthOfType): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthOfType && value._index.equals(this._index);
  }

  public toJSON(): NthOfType.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace NthOfType {
  export interface JSON extends WithIndex.JSON<"nth-of-type"> {}

  export const parse = WithIndex.parseWithIndex("nth-of-type", NthOfType.of);
}
