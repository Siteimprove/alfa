import type { Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute } from "../../index.js";
import { BaseSelector } from "../../selector.js";

import { WithSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends WithSelector<"has"> {
  public static of(selector: Absolute): Has {
    return new Has(selector);
  }

  protected constructor(selector: Absolute) {
    super("has", selector, selector.specificity);
  }

  public *[Symbol.iterator](): Iterator<Has> {
    yield this;
  }

  public equals(value: Has): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Has && value._selector.equals(this._selector);
  }

  public toJSON(): Has.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace Has {
  export interface JSON extends WithSelector.JSON<"has"> {}

  // :has() normally only accepts relative selectors, we currently
  // accept only non-relative ones…
  export const parse = (parseSelector: BaseSelector.ComponentParser) =>
    // @ts-ignore
    WithSelector.parseWithSelector("has", parseSelector, Has.of);
}
