import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";

import { PseudoClassSelector } from "./pseudo-class";

const { hasName, isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-of-type-pseudo}
 */
export class NthLastOfType extends PseudoClassSelector<"nth-last-of-type"> {
  public static of(index: Nth): NthLastOfType {
    return new NthLastOfType(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-last-of-type");

    this._index = index;
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
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthLastOfType {
  export interface JSON extends PseudoClassSelector.JSON<"nth-last-of-type"> {
    index: Nth.JSON;
  }
}
