import type { Element } from "@siteimprove/alfa-dom";

import type { Context } from "../../../context.js";
import type { Absolute, Selector } from "../../index.js";
import { Specificity } from "../../../specificity.js";

import { WithSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#zero-matches}
 */
export class Where extends WithSelector<"where"> {
  public static of(selector: Absolute): Where {
    return new Where(selector);
  }

  protected constructor(selector: Absolute) {
    super("where", selector, Specificity.of(0, 0, 0), selector.useContext);
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

  export const parse = (parseSelector: Selector.Parser.Component) =>
    WithSelector.parseWithSelector(
      "where",
      () => parseSelector({ forgiving: true }),
      Where.of,
    );
}
