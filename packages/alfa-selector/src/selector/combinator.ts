import { Cache } from "@siteimprove/alfa-cache";
import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Complex } from "./complex.js";

import { Compound } from "./compound.js";

import { Context } from "../context.js";

import { Host } from "./pseudo/pseudo-class/host.js";
import { HostContext } from "./pseudo/pseudo-class/host-context.js";
import { Slotted } from "./pseudo/pseudo-element/slotted.js";
import type { Simple } from "./simple/index.js";

const { isElement } = Element;
const { delimited, either, map, option } = Parser;
const { and } = Refinement;

/**
 * {@link https://drafts.csswg.org/selectors/#selector-combinator}
 *
 * @public
 */
export enum Combinator {
  /**
   * @example div span
   */
  Descendant = " ",

  /**
   * @example div \> span
   */
  DirectDescendant = ">",

  /**
   * @example div ~ span
   */
  Sibling = "~",

  /**
   * @example div + span
   */
  DirectSibling = "+",
}

/**
 * @public
 */
export namespace Combinator {
  /**
   * Does the element match?
   *
   * @remarks
   * This gets pretty hairy when shadow selectors (:host, :host-context,
   * ::slotted) are used in a complex selector.
   * * ::slotted may be used in the rightmost, e.g., `div ::slotted(p)`.
   *   In that case, the full selector matches something in the light,
   *   depending on the structure of the shadow tree. Thus, the full selector must
   *   be considered as a shadow selector (it matches out of its tree), and this
   *   can simply use tree traversal options to navigate the flat tree
   *   structure. However, the actual match toward the element must use the
   *   advanced #matchSlotted.
   * * :host and :host-context may be used as the leftmost, e.g., `:host(.foo) p`.
   *   This is useful to let users customise components through a simple
   *   class name on the custom element. In this case, the full selector
   *   matches something in the shadow tree and the full selector must **not**
   *   be considered as shadow selector (it matches in its own tree). But upon
   *   hitting the :host or :host-context, the matching must be delegated to
   *   the advance #matchHost (and jump over the shadow root to the actual
   *   host).
   *
   * @privateRemarks
   * Due to the recursive nature of the check, we oversimplify it a bit.
   * Namely, we do not really check that ::slotted appears in the rightmost
   * position only. This means that we incorrectly match thinks like
   * `div ::slotted(*) span` to a <span> descendant **in the light tree** of the
   * slotted element. This is incorrect, see CSS discussions about the
   * deprecated ::content. However, this shouldn't be a problem because
   * Selector.isShadow classify complex selectors by the presence of
   * ::slotted in the rightmost position only. Therefore, such a selector
   * will try to match in its own tree and fail to match the slotted element.
   *
   * In the rare case where (i) people use this incorrect structure and (ii)
   * it happens that there is a sub-shadow tree with structure similar enough
   * to cause the match, this will be incorrect, but we can probably live with
   * it until we see it.
   */
  export function matcher(
    left: Simple | Compound | Complex,
    combinator: Combinator,
    right: Simple | Compound,
    element: Element,
    context?: Context,
  ): boolean {
    let traversal = Node.Traversal.empty;
    let rightMatches = false;

    if (
      Slotted.isSlotted(right) ||
      (Compound.isCompound(right) &&
        Iterable.some(right.selectors, Slotted.isSlotted))
    ) {
      // The right side of the selector contains a ::slotted pseudo-element.
      traversal = Node.flatTree;
      rightMatches = Slotted.matchSlotted(element, right, context);
    } else {
      rightMatches = right.matches(element, context);
    }

    // First, make sure that the right side of the selector, i.e. the part
    // that relates to the current element, matches.
    if (rightMatches) {
      // If it does, move on to the heavy part of the work: Looking either up
      // the tree for a descendant match or looking to the side of the tree
      // for a sibling match.

      // avoid performing the actual left match in the off case where there is no
      // ancestor/sibling/… Hence, use a continuation here, evaluate it later.
      let leftMatches = left.matches.bind(left);
      let filter: Refinement<Node, Element> = isElement;
      let inShadow = false;
      if (Host.isHost(left) || HostContext.isHostContext(left)) {
        leftMatches = left.matchHost.bind(left);
        traversal = Node.flatTree;
        // .matchHost expects to be called on the shadow host, so we filter away
        // other elements beforehand.
        filter = and(isElement, (element) => element.shadow.isSome());
        inShadow = true;
      }

      switch (combinator) {
        case Combinator.Descendant:
          return inShadow
            ? element
                .ancestors(traversal)
                .filter(filter)
                .some((element) => leftMatches(element, context))
            : ancestorMatchesLeft(element, context, left);

        case Combinator.DirectDescendant:
          return element
            .parent(traversal)
            .filter(filter)
            .some((element) => leftMatches(element, context));

        case Combinator.Sibling:
          return element
            .preceding(traversal)
            .filter(filter)
            .some((element) => leftMatches(element, context));

        case Combinator.DirectSibling:
          return element
            .preceding(traversal)
            .find(filter)
            .some((element) => leftMatches(element, context));
      }
    }

    return false;
  }

  const _ancestorMatchCache = Cache.empty<
    Element,
    Cache<Context, Cache<Simple | Compound | Complex, boolean>>
  >();
  /**
   * Checks if a (strict) ancestor of element matches.
   *
   * @remarks
   * The result is cached, so that when matching `div.foo li`, we do not waste
   * time going all the way to the root for every `<li>`, instead we'll stop at
   * the first ancestor already encountered, e.g., the common parent `<ul>` of
   * a bunch of siblings `<li>`.
   */
  function ancestorMatchesLeft(
    element: Element,
    context: Context = Context.empty(),
    left: Simple | Compound | Complex,
  ): boolean {
    return _ancestorMatchCache
      .get(element, Cache.empty)
      .get(context, Cache.empty)
      .get(left, () =>
        element
          .parent()
          .filter(isElement)
          .some(
            (parent) =>
              left.matches(parent, context) ||
              ancestorMatchesLeft(parent, context, left),
          ),
      );
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-combinator}
   *
   * @internal
   */
  export const parse: CSSParser<Combinator> = either(
    delimited(
      option(Token.parseWhitespace),
      either(
        map(Token.parseDelim(">"), () => Combinator.DirectDescendant),
        map(Token.parseDelim("~"), () => Combinator.Sibling),
        map(Token.parseDelim("+"), () => Combinator.DirectSibling),
      ),
    ),
    map(Token.parseWhitespace, () => Combinator.Descendant),
  );
}
