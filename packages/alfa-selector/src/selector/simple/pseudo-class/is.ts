import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context.js";
import type { Absolute } from "../../../selector/index.js";

import { WithSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#matches-pseudo}
 */
export class Is extends WithSelector<"is"> {
  public static of(selector: Absolute): Is {
    return new Is(selector);
  }

  private constructor(selector: Absolute) {
    super("is", selector, selector.specificity);
  }

  public *[Symbol.iterator](): Iterator<Is> {
    yield this;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._selector.matches(element, context);
  }

  public equals(value: Is): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Is && value._selector.equals(this._selector);
  }

  public toJSON(): Is.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace Is {
  export interface JSON extends WithSelector.JSON<"is"> {}

  export const parse = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    WithSelector.parseWithSelector("is", parseSelector, Is.of);
}
