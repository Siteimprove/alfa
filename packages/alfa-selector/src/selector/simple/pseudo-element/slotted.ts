import { Function, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { Compound } from "../../compound";
import { Simple } from "../../simple";

import { PseudoElementSelector } from "./pseudo-element";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-scoping/#slotted-pseudo}
 */
export class Slotted extends PseudoElementSelector<"slotted"> {
  public static of(selector: Compound | Simple): Slotted {
    return new Slotted(selector);
  }

  private readonly _selector: Compound | Simple;

  private constructor(selector: Compound | Simple) {
    super("slotted");
    this._selector = selector;
  }

  /** @public (knip) */
  public get selector(): Compound | Simple {
    return this._selector;
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Slotted> {
    yield this;
  }

  public equals(value: Slotted): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Slotted && value._selector.equals(this._selector);
  }

  public toJSON(): Slotted.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._selector})`;
  }
}

export namespace Slotted {
  export interface JSON extends PseudoElementSelector.JSON<"slotted"> {
    selector: Compound.JSON | Simple.JSON;
  }

  export function parse(
    parseSelector: Thunk<CSSParser<Compound | Simple>>,
  ): CSSParser<Slotted> {
    return map(Function.parse("slotted", parseSelector), ([_, selector]) =>
      Slotted.of(selector),
    );
  }
}
