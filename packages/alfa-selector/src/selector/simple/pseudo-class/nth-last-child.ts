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
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends WithIndexAndSelector<"nth-last-child"> {
  public static of(index: Nth, selector: Maybe<Absolute> = None): NthLastChild {
    return new NthLastChild(index, Maybe.toOption(selector));
  }

  private constructor(nth: Nth, selector: Option<Absolute>) {
    super("nth-last-child", nth, selector);
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<NthLastChild> {
    yield this;
  }

  public matches(element: Element, context?: Context): boolean {
    const indices = NthLastChild._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter((element) =>
          this._selector.every((selector) =>
            selector.matches(element, context),
          ),
        )
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
    return value instanceof NthLastChild && super.equals(value);
  }

  public toJSON(): NthLastChild.JSON {
    return super.toJSON();
  }
}

export namespace NthLastChild {
  export interface JSON extends WithIndexAndSelector.JSON<"nth-last-child"> {}

  export const parse = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    WithIndexAndSelector.parseWithIndexAndSelector(
      "nth-last-child",
      parseSelector,
      NthLastChild.of,
    );
}
