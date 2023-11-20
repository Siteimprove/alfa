import type { Element } from "@siteimprove/alfa-dom";
import type { Serializable } from "@siteimprove/alfa-json";

import type { Context } from "../../context";

import type { Absolute } from "../index";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#matches-pseudo}
 */
export class Is extends PseudoClassSelector<"is"> {
  public static of(selector: Absolute): Is {
    return new Is(selector);
  }

  private readonly _selector: Absolute;

  private constructor(selector: Absolute) {
    super("is");
    this._selector = selector;
  }

  public get selector(): Absolute {
    return this._selector;
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
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

export namespace Is {
  export interface JSON extends PseudoClassSelector.JSON<"is"> {
    selector: Serializable.ToJSON<Absolute>;
  }
}
