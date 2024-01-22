/// <reference lib="dom" />
import {
  Function,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Element, type Slotable } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";
import { Context } from "../../../context";
import { Specificity } from "../../../specificity";

import type { Compound } from "../../compound";
import type { Simple } from "../../simple";

import { PseudoElementSelector } from "./pseudo-element";

const { map, right, take } = Parser;

/**
 * {@link https://drafts.csswg.org/css-scoping/#slotted-pseudo}
 *
 * @public
 */
export class Slotted extends PseudoElementSelector<"slotted"> {
  public static of(selector: Compound | Simple): Slotted {
    return new Slotted(selector);
  }

  private readonly _selector: Compound | Simple;

  private constructor(selector: Compound | Simple) {
    super(
      "slotted",
      Specificity.sum(selector.specificity, Specificity.of(0, 0, 1)),
    );
    this._selector = selector;
  }

  /** @public (knip) */
  public get selector(): Compound | Simple {
    return this._selector;
  }

  /**
   * @remarks
   * `::slotted` never aliases an element in its own tree.
   */
  public matches(): boolean {
    return false;
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

/**
 * @public
 */
export namespace Slotted {
  export interface JSON extends PseudoElementSelector.JSON<"slotted"> {
    selector: Compound.JSON | Simple.JSON;
  }

  export function isSlotted(value: unknown): value is Slotted {
    return value instanceof Slotted;
  }

  export function parse(
    parseSelector: Thunk<CSSParser<Compound | Simple>>,
  ): CSSParser<Slotted> {
    return map(
      right(
        take(Token.parseColon, 2),
        Function.parse("slotted", parseSelector),
      ),
      ([_, selector]) => Slotted.of(selector),
    );
  }
}
