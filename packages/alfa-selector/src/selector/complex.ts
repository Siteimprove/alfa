import { Cache } from "@siteimprove/alfa-cache";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Context } from "../context.js";
import type { Selector } from "./index.js";
import { Specificity } from "../specificity.js";

import { Combinator } from "./combinator.js";
import { Compound } from "./compound.js";
import { BaseSelector } from "./selector.js";
import type { Class, Id, Simple, Type } from "./simple/index.js";

import { Host } from "./pseudo/pseudo-class/host.js";
import { HostContext } from "./pseudo/pseudo-class/host-context.js";
import { Slotted } from "./pseudo/pseudo-element/slotted.js";

const { isElement } = Element;
const { map, pair, zeroOrMore } = Parser;
const { and } = Refinement;

/**
 * {@link https://drafts.csswg.org/selectors/#complex}
 *
 * @public
 */
export class Complex extends BaseSelector<"complex"> {
  public static of(
    combinator: Combinator,
    left: Simple | Compound | Complex,
    right: Simple | Compound,
  ): Complex {
    return new Complex(combinator, left, right);
  }

  private readonly _combinator: Combinator;
  private readonly _left: Simple | Compound | Complex;
  private readonly _right: Simple | Compound;
  protected readonly _key: Option<Id | Class | Type>;

  protected constructor(
    combinator: Combinator,
    left: Simple | Compound | Complex,
    right: Simple | Compound,
  ) {
    super("complex", Specificity.sum(left.specificity, right.specificity));
    this._combinator = combinator;
    this._left = left;
    this._right = right;

    this._key = right.key;
  }

  public get combinator(): Combinator {
    return this._combinator;
  }

  public get left(): Simple | Compound | Complex {
    return this._left;
  }

  public get right(): Simple | Compound {
    return this._right;
  }

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
  public matches(element: Element, context?: Context): boolean {
    let traversal = Node.Traversal.empty;
    let rightMatches = false;

    if (
      Slotted.isSlotted(this._right) ||
      (Compound.isCompound(this._right) &&
        Iterable.some(this._right.selectors, Slotted.isSlotted))
    ) {
      // The right side of the selector contains a ::slotted pseudo-element.
      traversal = Node.flatTree;
      rightMatches = Slotted.matchSlotted(element, this._right, context);
    } else {
      rightMatches = this._right.matches(element, context);
    }

    // First, make sure that the right side of the selector, i.e. the part
    // that relates to the current element, matches.
    if (rightMatches) {
      // If it does, move on to the heavy part of the work: Looking either up
      // the tree for a descendant match or looking to the side of the tree
      // for a sibling match.

      // avoid performing the actual left match in the off case where there is no
      // ancestor/sibling/… Hence, use a continuation here, evaluate it later.
      let leftMatches = this._left.matches.bind(this._left);
      let filter: Refinement<Node, Element> = isElement;
      let inShadow = false;
      if (Host.isHost(this._left) || HostContext.isHostContext(this._left)) {
        leftMatches = this._left.matchHost.bind(this._left);
        traversal = Node.flatTree;
        // .matchHost expects to be called on the shadow host, so we filter away
        // other elements beforehand.
        filter = and(isElement, (element) => element.shadow.isSome());
        inShadow = true;
      }

      switch (this._combinator) {
        case Combinator.Descendant:
          return inShadow
            ? element
                .ancestors(traversal)
                .filter(filter)
                .some((element) => leftMatches(element, context))
            : this.ancestorMatchesLeft(element, context);

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

  private _ancestorMatchCache = Cache.empty<Element, Cache<Context, boolean>>();
  /**
   * Checks if a (strict) ancestor of element matches.
   *
   * @remarks
   * The result is cached, so that when matching `div.foo li`, we do not waste
   * time going all the way to the root for every `<li>`, instead we'll stop at
   * the first ancestor already encountered, e.g., the common parent `<ul>` of
   * a bunch of siblings `<li>`.
   */
  private ancestorMatchesLeft(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return this._ancestorMatchCache.get(element, Cache.empty).get(context, () =>
      element
        .parent()
        .filter(isElement)
        .some(
          (parent) =>
            this._left.matches(parent, context) ||
            this.ancestorMatchesLeft(parent, context),
        ),
    );
  }

  public equals(value: Complex): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Complex &&
      value._combinator === this._combinator &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  public *[Symbol.iterator](): Iterator<Complex> {
    yield this;
  }

  public toJSON(): Complex.JSON {
    return {
      ...super.toJSON(),
      combinator: this._combinator,
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    const combinator =
      this._combinator === Combinator.Descendant
        ? " "
        : ` ${this._combinator} `;

    return `${this._left}${combinator}${this._right}`;
  }
}

/**
 * @public
 */
export namespace Complex {
  export interface JSON extends BaseSelector.JSON<"complex"> {
    combinator: Combinator;
    left: Simple.JSON | Compound.JSON | Complex.JSON;
    right: Simple.JSON | Compound.JSON;
  }

  export function isComplex(value: unknown): value is Complex {
    return value instanceof Complex;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-complex-selector}
   *
   * @internal
   */
  export const parse = (parseSelector: Selector.ComponentParser<Selector>) =>
    map(
      pair(
        Compound.parse(parseSelector),
        zeroOrMore(pair(Combinator.parse, Compound.parse(parseSelector))),
      ),
      (result) => {
        const [left, selectors] = result;

        return Iterable.reduce(
          selectors,
          (left, [combinator, right]) => Complex.of(combinator, left, right),
          left as Simple | Compound | Complex,
        );
      },
    );
}
