import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends PseudoClassSelector<"nth-last-child"> {
  public static of(index: Nth): NthLastChild {
    return new NthLastChild(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(nth: Nth) {
    super("nth-last-child");

    this._index = nth;
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
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthLastChild {
  export interface JSON extends PseudoClassSelector.JSON<"nth-last-child"> {
    index: Nth.JSON;
  }
}
