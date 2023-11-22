import { Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context";
import type { Absolute } from "../../../selector";

import { WithSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#negation-pseudo}
 */
export class Not extends WithSelector<"not"> {
  public static of(selector: Absolute): Not {
    return new Not(selector);
  }

  private constructor(selector: Absolute) {
    super("not", selector);
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Not> {
    yield this;
  }

  public matches(element: Element, context?: Context): boolean {
    return !this._selector.matches(element, context);
  }

  public equals(value: Not): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Not && value._selector.equals(this._selector);
  }

  public toJSON(): Not.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace Not {
  export interface JSON extends WithSelector.JSON<"not"> {}

  export const parse = (parseSelector: Thunk<CSSParser<Absolute>>) =>
    WithSelector.parseWithSelector("not", parseSelector, Not.of);
}
