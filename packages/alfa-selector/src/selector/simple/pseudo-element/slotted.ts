import {
  Function,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Element, type Slotable } from "@siteimprove/alfa-dom";
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
   * Due to jumping between the light and shadow trees (and the nature of
   * pseudo-element where part of the compound selector must match the originating
   * element and other part must match the aliased element), matching a compound
   * selector containing a ::slotted pseudo-element is more complex than each
   * part individually. Therefore, this needs the full compound selector and
   * cannot simply be a method on the Slotted class.
   *
   * @privateRemarks
   * There is a potential circular dependency: Slotted -> Compound -> Simple -> Slotted.
   * We avoid this by checking `selector.type` rather than using Compound.isCompound.
   */
  export function matchSlotted(
    element: Element,
    selector: Compound | Simple,
    context: Context = Context.empty(),
  ): boolean {
    // The part of `selector` that must match the slot.
    const slotSelectors: Array<Simple> = [];
    // The part of `selector` that must match the slotted element
    // (pseudo-classes after ::slotted).
    const qualifier: Array<Simple> = [];

    const selectors =
      selector.type === "compound" ? selector.selectors : [selector];

    let actualSelector: Option<Slotted> = None;
    let seen = false;

    for (const candidate of selectors) {
      if (Slotted.isSlotted(candidate)) {
        if (actualSelector.isSome()) {
          // If there is more than one ::slotted selector, this cannot match.
          return false;
        }
        actualSelector = Option.of(candidate);
        seen = true;
      } else if (seen) {
        qualifier.push(candidate);
      } else {
        slotSelectors.push(candidate);
      }
    }

    const slot = element.assignedSlot();

    return (
      // `element` must be slotted.
      slot.some((slot) =>
        // The slot must match the slot selectors, if any.
        slotSelectors.every((selector) => selector.matches(slot, context)),
      ) &&
      // There must be an actual ::slotted selector.
      actualSelector.some((slotted) =>
        // `element` must match the argument of the actual ::slotted selector.
        slotted.selector.matches(element, context),
      ) &&
      // `element` must match the qualifier, if any.
      qualifier.every((selector) => selector.matches(element, context))
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
