import type { Relative, Selector } from "../../index.js";

import { WithSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends WithSelector<"has", Relative> {
  public static of(selector: Relative): Has {
    return new Has(selector);
  }

  protected constructor(selector: Relative) {
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
    return super.toJSON();
  }
}

export namespace Has {
  export interface JSON extends WithSelector.JSON<"has", Relative> {}

  export const parse = (parseSelector: Selector.Parser.Component) =>
    WithSelector.parseWithSelector(
      "has",
      () => parseSelector({ relative: true }),
      Has.of,
    );
}
