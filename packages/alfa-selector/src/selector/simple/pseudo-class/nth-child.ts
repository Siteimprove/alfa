import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Maybe, None, Option } from "@siteimprove/alfa-option";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context";

import type { Absolute } from "../../index";

import { WithIndexAndSelector } from "./pseudo-class";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-child-pseudo}
 */
export class NthChild extends WithIndexAndSelector<"nth-child"> {
  public static of(index: Nth, selector: Maybe<Absolute> = None): NthChild {
    return new NthChild(index, Maybe.toOption(selector));
  }

  private constructor(index: Nth, selector: Option<Absolute>) {
    super("nth-child", index, selector);
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
        .filter((element) =>
          this._selector.every((selector) =>
            selector.matches(element, context),
          ),
        )
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthChild): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthChild && super.equals(value);
  }

  public toJSON(): NthChild.JSON {
    return super.toJSON();
  }
}

export namespace NthChild {
  export interface JSON extends WithIndexAndSelector.JSON<"nth-child"> {}

  export const parse = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    WithIndexAndSelector.parseWithIndexAndSelector(
      "nth-child",
      parseSelector,
      NthChild.of,
    );
}
