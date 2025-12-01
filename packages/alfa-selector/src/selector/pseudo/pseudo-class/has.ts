import { Cache } from "@siteimprove/alfa-cache";
import { Element, Query } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Context } from "../../../context.js";
import { Combinator, type Relative, type Selector } from "../../index.js";

import { WithSelector } from "./pseudo-class.js";

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends WithSelector<"has", Relative> {
  public static of(selector: Relative): Has {
    return new Has(selector);
  }

  protected constructor(selector: Relative) {
    super("has", selector, selector.specificity, selector.useContext);
  }

  public matches(element: Element, context?: Context): boolean {
    return this.useContext
      ? this._matches(element, context ?? Context.empty())
      : // If context is irrelevant, use the empty context to increase cache hit
        // chances.
        this._matches(element, Context.empty());
  }

  /**
   * Whether an element match.
   *
   * @remarks
   * This method is further cached because it rebuilds new anchored selectors
   * on each call, so it wouldn't be able to use other caches, notably for
   * ancestors/descendants matching which can be expensive.
   */
  @Cache.memoize
  private _matches(element: Element, context: Context): boolean {
    const selectors = Iterable.map(this._selector, (selector) =>
      selector.anchoredAt(element),
    );

    return Iterable.some(selectors, (selector) => {
      let candidates: Iterable<Element>;

      // While the relative match could theoretically happen anywhere in the
      // DOM tree, we optimize the search based on the anchor and combinator.
      switch (selector.combinator) {
        case Combinator.Descendant:
          candidates = Query.getElementDescendants(element);
          break;

        case Combinator.DirectDescendant:
          candidates = element.children().filter(Element.isElement);
          break;

        case Combinator.Sibling:
          candidates = element
            .inclusiveSiblings()
            .skipUntil((elt) => elt === element)
            .skip(1)
            .filter(Element.isElement);
          break;

        case Combinator.DirectSibling:
          candidates = element
            .inclusiveSiblings()
            .skipUntil((elt) => elt === element)
            .skip(1)
            .first()
            .filter(Element.isElement);
          break;
      }

      return Iterable.some(candidates, (candidate) =>
        selector.matches(candidate, context),
      );
    });
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
    return super.toJSON();
  }
}

export namespace Has {
  export interface JSON extends WithSelector.JSON<"has", Relative> {}

  export const parse = (
    parseSelector: Selector.Parser.Component,
    withColon = true,
  ) =>
    WithSelector.parseWithSelector(
      "has",
      () => parseSelector({ relative: true }),
      Has.of,
      withColon,
    );
}
