import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-child-pseudo}
 */
export class NthChild extends PseudoClassSelector<"nth-child"> {
  public static of(index: Nth): NthChild {
    return new NthChild(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-child");

    this._index = index;
  }

  public *[Symbol.iterator](): Iterator<NthChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    const indices = NthChild._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthChild): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthChild && value._index.equals(this._index);
  }

  public toJSON(): NthChild.JSON {
    return {
      ...super.toJSON(),
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthChild {
  export interface JSON extends PseudoClassSelector.JSON<"nth-child"> {
    index: Nth.JSON;
  }
}
