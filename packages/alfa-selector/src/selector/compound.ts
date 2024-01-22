import { Array } from "@siteimprove/alfa-array";
import { Token } from "@siteimprove/alfa-css";
import { Element, type Slotable } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Context } from "../context";
import { Specificity } from "../specificity";
import type { Absolute } from "./index";

import { Selector } from "./selector";
import { type Class, type Id, Simple, type Type } from "./simple";

import { Slotted } from "./simple/pseudo-element/slotted";

const { map, oneOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#compound}
 *
 * @public
 */
export class Compound extends Selector<"compound"> {
  public static of(...selectors: Array<Simple>): Compound {
    return new Compound(selectors);
  }

  private readonly _selectors: Array<Simple>;
  private readonly _length: number;
  protected readonly _key: Option<Id | Class | Type>;

  private constructor(selectors: Array<Simple>) {
    super(
      "compound",
      Specificity.sum(...selectors.map((selector) => selector.specificity)),
    );
    this._selectors = selectors;
    this._length = selectors.length;

    this._key = selectors[0]?.key ?? None;
  }

  public get selectors(): Iterable<Simple> {
    return this._selectors;
  }

  public get length(): number {
    return this._length;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._selectors.every((selector) =>
      selector.matches(element, context),
    );
  }

  public equals(value: Compound): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Compound &&
      Array.equals(value._selectors, this._selectors)
    );
  }

  public *[Symbol.iterator](): Iterator<Compound> {
    yield this;
  }

  public toJSON(): Compound.JSON {
    return {
      ...super.toJSON(),
      selectors: this._selectors.map((selector) => selector.toJSON()),
    };
  }

  public toString(): string {
    return this._selectors.map((selector) => selector.toString()).join("");
  }
}

/**
 * @public
 */
export namespace Compound {
  export interface JSON extends Selector.JSON<"compound"> {
    selectors: Array<Simple.JSON>;
  }

  export function isCompound(value: unknown): value is Compound {
    return value instanceof Compound;
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
    let slotSelector: Option<Compound> = None;
    // The part of `selector` that must match the slotted element
    // (pseudo-classes after ::slotted).
    let qualifier: Option<Compound> = None;

    const selectors = Compound.isCompound(selector)
      ? [...selector.selectors]
      : [selector];

    if (selectors.filter(Slotted.isSlotted).length !== 1) {
      // There is either 0, or several `::slotted()` in the compound selector.
      return false;
    }

    // We know there is exactly one `::slotted()` in the compound selector.
    const actualSelector = selectors.find(Slotted.isSlotted) as Slotted;

    if (selectors.length > 1) {
      // The slot selector is the start of the compound selector, until ::slotted.
      slotSelector = Option.of(
        Compound.of(
          ...Iterable.takeUntil(selectors, (selector) =>
            Slotted.isSlotted(selector),
          ),
        ),
      );

      qualifier = Option.of(
        Compound.of(
          ...Iterable.takeLastUntil(selectors, (selector) =>
            Slotted.isSlotted(selector),
          ),
        ),
      );
    }

    const slot = element.assignedSlot();

    return (
      // `element` must be slotted.
      slot.some((slot) =>
        // The slot must match the slot selector, if any.
        slotSelector.every((selector) => selector.matches(slot, context)),
      ) &&
      // `element` must match the argument of the actual ::slotted selector.
      actualSelector.selector.matches(element, context) &&
      // `element` must match the qualifier, if any.
      qualifier.every((selector) => selector.matches(element, context))
    );
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-compound-selector}
   *
   * @internal
   */
  export const parseCompound = (
    parseSelector: () => Parser<Slice<Token>, Absolute, string>,
  ) =>
    map(oneOrMore(Simple.parse(parseSelector)), (result) =>
      result.length === 1 ? result[0] : Compound.of(...result),
    );
}
