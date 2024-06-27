import { Parser as CSSParser } from "@siteimprove/alfa-css";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Context } from "../../../context.js";
import { Specificity } from "../../../specificity.js";
import type { Compound, Simple } from "../../index.js";

import { WithSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-context}
 *
 * @privateRemarks
 * In CSS lingo, `:host-context` only accepts a compound selector, but simple
 * selectors are also compounds. Alfa does make a type difference between
 * a Simple selector and a compound selector with only a single Simple
 * selector. Hence, this also accepts Simple selector. This also accepts
 * pseudo-elements, which seems to not be really allowed by the specification.
 *
 * @public
 */
export class HostContext extends WithSelector<
  "host-context",
  Compound | Simple
> {
  public static of(selector: Compound | Simple): HostContext {
    return new HostContext(selector);
  }

  private constructor(selector: Compound | Simple) {
    super(
      "host-context",
      selector,
      Specificity.sum(selector.specificity, Specificity.of(0, 1, 0)),
    );
  }

  public *[Symbol.iterator](): Iterator<HostContext> {
    yield this;
  }

  /**
   * @remarks
   * `:host-context` never matches anything in its own tree.
   */
  public matches(element: Element, context?: Context): boolean {
    return false;
  }

  public matchHost(
    /**
     * Checks whether a shadow host matches.
     *
     * @remarks
     * This must be called with `element` being the shadow host of
     * the Document that defines the selector.
     */
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return element
      .inclusiveAncestors(Node.Traversal.of(Node.Traversal.composed))
      .filter(Element.isElement)
      .some((ancestor) => this._selector.matches(ancestor, context));
  }

  public equals(value: HostContext): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof HostContext && value._selector.equals(this._selector)
    );
  }

  public toJSON(): HostContext.JSON {
    return {
      ...super.toJSON(),
    };
  }
}

export namespace HostContext {
  export interface JSON
    extends WithSelector.JSON<"host-context", Compound | Simple> {}

  export function isHostContext(value: unknown): value is HostContext {
    return value instanceof HostContext;
  }

  export const parse = (parseSelector: Thunk<CSSParser<Compound | Simple>>) =>
    WithSelector.parseWithSelector(
      "host-context",
      parseSelector,
      HostContext.of,
    );
}
