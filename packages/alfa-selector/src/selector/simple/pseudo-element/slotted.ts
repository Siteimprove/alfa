import { Array } from "@siteimprove/alfa-array";

import { Compound } from "../../compound";
import { Simple } from "../../simple";

import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-scoping/#slotted-pseudo}
 */
export class Slotted extends PseudoElementSelector<"slotted"> {
  public static of(selectors: Iterable<Simple | Compound>): Slotted {
    return new Slotted(Array.from(selectors));
  }

  private readonly _selectors: ReadonlyArray<Simple | Compound>;

  private constructor(selectors: Array<Simple | Compound>) {
    super("slotted");
    this._selectors = selectors;
  }

  public get selectors(): Iterable<Simple | Compound> {
    return this._selectors;
  }

  public *[Symbol.iterator](): Iterator<Slotted> {
    yield this;
  }

  public equals(value: Slotted): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Slotted &&
      Array.equals(value._selectors, this._selectors)
    );
  }

  public toJSON(): Slotted.JSON {
    return {
      ...super.toJSON(),
      selectors: Array.toJSON(this._selectors),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._selectors})`;
  }
}

export namespace Slotted {
  export interface JSON extends PseudoElementSelector.JSON<"slotted"> {
    selectors: Array<Simple.JSON | Compound.JSON>;
  }
}
