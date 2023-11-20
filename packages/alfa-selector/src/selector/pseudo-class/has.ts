import type { Serializable } from "@siteimprove/alfa-json";

import type { Absolute } from "../index";

import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends PseudoClassSelector<"has"> {
  public static of(selector: Absolute): Has {
    return new Has(selector);
  }

  private readonly _selector: Absolute;

  private constructor(selector: Absolute) {
    super("has");
    this._selector = selector;
  }

  public get selector(): Absolute {
    return this._selector;
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
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

export namespace Has {
  export interface JSON extends PseudoClassSelector.JSON<"has"> {
    selector: Serializable.ToJSON<Absolute>;
  }
}
