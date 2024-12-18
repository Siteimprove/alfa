import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";

import { WithIndex } from "./pseudo-class.js";

const { hasName, isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-of-type-pseudo}
 */
export class NthLastOfType extends WithIndex<"nth-last-of-type"> {
  public static of(index: Nth): NthLastOfType {
    return new NthLastOfType(index);
  }

  protected constructor(index: Nth) {
    super("nth-last-of-type", index);
  }

  public *[Symbol.iterator](): Iterator<NthLastOfType> {
    yield this;
  }

  public matches(element: Element): boolean {
    const indices = NthLastOfType._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter(hasName(element.name))
        .reverse()
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthLastOfType): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthLastOfType && value._index.equals(this._index);
  }

  public toJSON(): NthLastOfType.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace NthLastOfType {
  export interface JSON extends WithIndex.JSON<"nth-last-of-type"> {}

  export const parse = WithIndex.parseWithIndex(
    "nth-last-of-type",
    NthLastOfType.of,
  );
}
