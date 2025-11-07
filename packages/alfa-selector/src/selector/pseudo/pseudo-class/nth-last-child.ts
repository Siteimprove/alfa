import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Maybe, None, Option } from "@siteimprove/alfa-option";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context.js";
import { Selector } from "../../selector.js";
import { Universal } from "../../simple/universal.js";

import type { Absolute } from "../../index.js";

import { WithIndexAndSelector } from "./pseudo-class.js";

const { isElement } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends WithIndexAndSelector<"nth-last-child"> {
  public static of(index: Nth, selector: Maybe<Absolute> = None): NthLastChild {
    return new NthLastChild(index, Maybe.toOption(selector));
  }

  private readonly _indices = new WeakMap<Element, number>();

  protected constructor(nth: Nth, selector: Option<Absolute>) {
    super("nth-last-child", nth, selector);
  }

  public *[Symbol.iterator](): Iterator<NthLastChild> {
    yield this;
  }

  public matches(element: Element, context?: Context): boolean {
    if (!this._indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter((element) =>
          this._selector
            .getOr(Universal.of(Option.of("*")))
            .matches(element, context),
        )
        .reverse()
        .forEach((element, i) => {
          this._indices.set(element, i + 1);
        });
    }

    if (!this._indices.has(element)) {
      return false;
    }

    return this._index.matches(this._indices.get(element)!);
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

  export const parse = (parseSelector: Selector.ComponentParser) =>
    WithIndexAndSelector.parseWithIndexAndSelector(
      "nth-last-child",
      // @ts-ignore
      parseSelector,
      NthLastChild.of,
    );
}
