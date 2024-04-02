import { Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context";
import type { Absolute } from "../../../selector";
import { Specificity } from "../../../specificity";

import { WithSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#zero-matches}
 */
export class Where extends WithSelector<"where"> {
  public static of(selector: Absolute): Where {
    return new Where(selector);
  }

  private constructor(selector: Absolute) {
    super("where", selector, Specificity.of(0, 0, 0));
  }

  public *[Symbol.iterator](): Iterator<Where> {
    yield this;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._selector.matches(element, context);
  }

  public equals(value: Where): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Where && value._selector.equals(this._selector);
  }

  public toJSON(): Where.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace Where {
  export interface JSON extends WithSelector.JSON<"where"> {}

  export const parse = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    WithSelector.parseWithSelector("where", parseSelector, Where.of);
}
