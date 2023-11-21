import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";

import { WithIndex } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends WithIndex<"nth-last-child"> {
  public static of(index: Nth): NthLastChild {
    return new NthLastChild(index);
  }

  private constructor(nth: Nth) {
    super("nth-last-child", nth);
  }

  public *[Symbol.iterator](): Iterator<NthLastChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    const indices = NthLastChild._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .reverse()
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthLastChild): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthLastChild && value._index.equals(this._index);
  }

  public toJSON(): NthLastChild.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace NthLastChild {
  export interface JSON extends WithIndex.JSON<"nth-last-child"> {}

  export const parse = WithIndex.parseWithIndex(
    "nth-last-child",
    NthLastChild.of,
  );
}
