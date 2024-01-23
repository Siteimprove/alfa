import {
  Function,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Element, type Slotable } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
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

  /**
   * Check if an element matches a compound selector containing a`::slotted` pseudo-element.
   *
   * @remarks
   * `::slotted` can be used at the end of a compound selector, in which case the
   * start of the compound selector must match the assigned slot.
   * E.g., `div.foo::slotted(.bar)` matches a `.bar` slotted in a `div.foo`.
   *
   * @privateRemarks
   * This must be defined here to avoid circular dependencies:
   * Slotted -> Compound -> Simple -> Slotted.
   * Yet, this may not fully live at the top-level Selector due to
   * Complex.matches requiring to call this. For the sake of simplicity,
   * we re-export that from Selector.
   *
   * @internal
   */
  export function matchSlotted(
    element: Element & Slotable,
    selector: Compound | Simple,
    context: Context = Context.empty(),
  ): boolean {
    // The part of `selector` that must match the slot.
    let slotSelector: Iterable<Simple> = [];
    // The part of `selector` that must match the slotted element
    // (pseudo-classes after ::slotted).
    let qualifier: Iterable<Simple> = [];

    const selectors =
      selector.type === "compound" ? [...selector.selectors] : [selector];

    if (selectors.filter(Slotted.isSlotted).length !== 1) {
      // There is either 0, or several `::slotted()` in the compound selector.
      return false;
    }

    // We know there is exactly one `::slotted()` in the compound selector.
    const actualSelector = selectors.find(Slotted.isSlotted) as Slotted;

    if (selectors.length > 1) {
      // The slot selector is the start of the compound selector, until ::slotted.
      slotSelector = Iterable.takeUntil(selectors, (selector) =>
        Slotted.isSlotted(selector),
      );

      qualifier = Iterable.takeLastUntil(selectors, (selector) =>
        Slotted.isSlotted(selector),
      );
    }

    const slot = element.assignedSlot();

    return (
      // `element` must be slotted.
      slot.some((slot) =>
        // The slot must match the slot selector, if any.
        Iterable.every(slotSelector, (selector) =>
          selector.matches(slot, context),
        ),
      ) &&
      // `element` must match the argument of the actual ::slotted selector.
      actualSelector.selector.matches(element, context) &&
      // `element` must match the qualifier, if any.
      Iterable.every(qualifier, (selector) =>
        selector.matches(element, context),
      )
    );
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
