import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import { Context } from "../../../context";

import { type Absolute, Universal } from "../../index";

import { WithIndex } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-child-pseudo}
 */
export class NthChild extends WithIndex<"nth-child"> {
  public static of(
    index: Nth,
    selector: Absolute = Universal.of(Option.of("*")),
  ): NthChild {
    return new NthChild(index, selector);
  }

  private _selector: Absolute;

  private constructor(index: Nth, selector: Absolute) {
    super("nth-child", index);

    this._selector = selector;
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<NthChild> {
    yield this;
  }

  public matches(element: Element, context?: Context): boolean {
    const indices = NthChild._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter((element) => this._selector.matches(element, context))
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
    };
  }
}

export namespace NthChild {
  export interface JSON extends WithIndex.JSON<"nth-child"> {}

  export const parse = WithIndex.parseWithIndex("nth-child", NthChild.of);
}
