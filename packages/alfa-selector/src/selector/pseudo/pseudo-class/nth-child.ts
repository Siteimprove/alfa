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
 * {@link https://drafts.csswg.org/selectors/#nth-child-pseudo}
 */
export class NthChild extends WithIndexAndSelector<"nth-child"> {
  public static of(index: Nth, selector: Maybe<Absolute> = None): NthChild {
    return new NthChild(index, Maybe.toOption(selector));
  }

  private readonly _indices = new WeakMap<Element, number>();

  protected constructor(index: Nth, selector: Option<Absolute>) {
    super("nth-child", index, selector);
  }

  public *[Symbol.iterator](): Iterator<NthChild> {
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
        .forEach((element, i) => {
          this._indices.set(element, i + 1);
        });
    }

    if (!this._indices.has(element)) {
      return false;
    }

    return this._index.matches(this._indices.get(element)!);
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

  export const parse = (parseSelector: Selector.ComponentParser) =>
    WithIndexAndSelector.parseWithIndexAndSelector(
      "nth-child",
      // @ts-ignore
      parseSelector,
      NthChild.of,
    );
}
