import type { Element } from "@siteimprove/alfa-dom";
import type { Serializable } from "@siteimprove/alfa-json";

import type { Context } from "../../../context";
import type { Absolute } from "../../../selector";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#negation-pseudo}
 */
export class Not extends PseudoClassSelector<"not"> {
  public static of(selector: Absolute): Not {
    return new Not(selector);
  }

  private readonly _selector: Absolute;

  private constructor(selector: Absolute) {
    super("not");
    this._selector = selector;
  }

  public get selector(): Absolute {
    return this._selector;
  }

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
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

export namespace Not {
  export interface JSON extends PseudoClassSelector.JSON<"not"> {
    selector: Serializable.ToJSON<Absolute>;
  }
}
