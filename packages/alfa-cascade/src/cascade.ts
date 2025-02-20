import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Document, Node } from "@siteimprove/alfa-dom";
import { Element, Shadow, Slotable } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Context } from "@siteimprove/alfa-selector";

import type * as json from "@siteimprove/alfa-json";

import { AncestorFilter } from "./ancestor-filter.js";
import { Block } from "./block.js";
import { RuleTree } from "./rule-tree.js";
import { SelectorMap } from "./selector-map.js";
import { UserAgent } from "./user-agent.js";

/**
 * {@link https://drafts.csswg.org/css-cascade-5/}
 *
 * @remarks
 * The cascade associates to each element a node into a rule tree.
 * A single rule tree is built for each document or shadow root. The cascade
 * lazily fills it upon need and caches the associated node for each element.
 *
 * Upon creating a cascade, the full rule tree is built for the empty context
 * in order to leverage the ancestor filter during tree traversal. This assumes
 * that we will often query style of elements in an empty context (the default)
 * and thus benefit from pre-building it for all elements.
 *
 * For specific contexts, we only add the nodes in the rule tree as needed. We
 * assume that we mostly query only a few elements in a specific context, and
 * that the cost of rebuilding a full cascade would be too expensive.
 *
 * The cascade automatically includes the user agent style sheet.
 *
 * @public
 */
export class Cascade implements Serializable {
  private static readonly _cascades = Cache.empty<
    Document | Shadow,
    Cache<Device, Cascade>
  >();

  public static from(node: Document | Shadow, device: Device): Cascade {
    return this._cascades
      .get(node, Cache.empty)
      .get(device, () => new Cascade(node, device));
  }

  private readonly _root: Document | Shadow;
  private readonly _depth: number;
  private readonly _device: Device;
  private readonly _selectors: SelectorMap;
  private readonly _rules = RuleTree.empty();

  private readonly _entries = Cache.empty<
    Element,
    Cache<Context, RuleTree.Node>
  >();

  protected constructor(root: Document | Shadow, device: Device) {
    this._root = root;
    this._depth = getDepth(root);
    this._device = device;
    this._selectors = SelectorMap.from(
      [/*UserAgent,*/ ...root.style],
      device,
      this._depth,
    );

    // Perform a baseline cascade with an empty context to benefit from ancestor
    // filtering. As getting style information with an empty context will be the
    // common case, we benefit a lot from pre-computing this style information
    // with an ancestor filter applied.

    const context = Context.empty();

    const filter = AncestorFilter.empty();

    const visit = (node: Node): void => {
      if (Element.isElement(node)) {
        // Entering an element: add it to the rule tree, and to the ancestor filter.
        this._entries
          .get(node, Cache.empty)
          .get(context, () => this.add(node, context, filter));
        filter.add(node);
      }

      for (const child of node.children()) {
        visit(child);
      }

      if (Element.isElement(node)) {
        // Exiting an element: remove it from the ancestor filter.
        filter.remove(node);
      }
    };

    visit(root);
  }

  /**
   * Adds an element to the rules tree, return the associated node.
   */
  private add(
    element: Element,
    context: Context,
    filter: AncestorFilter,
  ): RuleTree.Node {
    // Blocks defined in a shadow tree hosted at `element`, and that apply to it
    // through a :host(-context) selector.
    const forHost = element.shadow
      .map((shadow) =>
        // Since selectors can pierce shadow upwards but not downwards, we
        // only recurse downwards and this is safe.
        Cascade.from(shadow, this._device)._selectors.getForHost(
          element,
          context,
        ),
      )
      .getOr([]);

    // Blocks defined in a shadow tree hosted at the parent of `element`,
    // and that apply to `element` through a ::slotted selector.
    const forSlotted = element
      .parent()
      .filter(Element.isElement)
      .flatMap((parent) => parent.shadow)
      .map((shadow) =>
        // Since selectors can pierce shadow upwards but not downwards, we
        // only recurse downwards and this is safe.
        Cascade.from(shadow, this._device)._selectors.getForSlotted(
          element,
          context,
        ),
      )
      .getOr([]);

    return this._rules.add(
      Iterable.concat<Block<Element | Block.Source, true>>(
        // Blocks defined in style sheets of the current tree, that match `element`
        this._selectors.get(element, context, filter),
        // Blocks defined in the `style` attribute of `element`.
        Block.fromStyle(element, this._depth),
        forHost,
        forSlotted,
      ),
    );
  }

  /**
   * Get the rule tree node associated with an element.
   *
   * @remarks
   * This also adds the element to the rule tree if needed. That is, the rule
   * tree is build lazily upon need. For the empty context, we pre-build the
   * full tree, so we can benefit from an ancestor filter as we traverse the
   * full DOM tree.
   *
   * For other contexts, we assume that we will only need the style of a few elements
   * (e.g., when a link is focused we normally only need the style of the link
   * itself). Therefore, pre-building the full tree is not worth the cost.
   */
  public get(
    element: Element,
    context: Context = Context.empty(),
  ): RuleTree.Node {
    return this._entries.get(element, Cache.empty).get(
      context,
      // If the entry hasn't been cached already, we assume we are querying
      // for a single element and pay the price of building its custom ancestor
      // filter, hopefully saving on the matching cost.
      () => {
        const filter = AncestorFilter.empty();
        // Because CSS selectors do not cross shadow or document boundaries,
        // only get ancestors in the same tree.
        // Adding elements to the ancestor filter is commutative, so we
        // can add them from bottom to root without reversing the sequence first.
        element
          .ancestors()
          .filter(Element.isElement)
          .forEach(filter.add.bind(filter));

        return this.add(element, context, filter);
      },
    );
  }

  public toJSON(): Cascade.JSON {
    return {
      root: this._root.toJSON(),
      device: this._device.toJSON(),
      selectors: this._selectors.toJSON(),
      rules: this._rules.toJSON(),
    };
  }
}

/**
 * @public
 */
export namespace Cascade {
  export interface JSON {
    [key: string]: json.JSON;
    root: Document.JSON | Shadow.JSON;
    device: Device.JSON;
    selectors: SelectorMap.JSON;
    rules: RuleTree.JSON;
  }
}

const shadowDepths = Cache.empty<Node, number>();

/**
 * Get the encapsulation depth
 *
 * @remarks
 * This one is a bit tricky because a shadow host `host` may itself
 * be slotted inside another shadow tree. In that case, host's shadow
 * tree has an encapsulation depth of 3 (itself, the slotting tree,
 * the main light tree). However, when looking at the DOM tree structure,
 * there is only one shadow host on its way to the main root.
 *
 * Using the flat tree does not really help, because it purposefully jumps
 * over shadow hosts and slots, which doesn't help for counting shadow hosts…
 *
 * Using the composed tree does not really help, because it does not resolve
 * slotting.
 *
 * Thus, we must do a custom traversal to both count the shadow hosts and
 * follow the slots.
 */
function getDepth(node: Node): number {
  return shadowDepths.get(node, () => {
    // If this is a Shadow root, get the depth of its host and increase
    // it. If it is not hosted, it has the minimum depth of 1 (0 is not
    // used to allow for negative/positive trick).
    if (Shadow.isShadow(node)) {
      return 1 + node.host.map(getDepth).getOr(0);
    }

    // If it is slotted, jump to the slot. Otherwise, go to the parent.
    // If there is no parent, we've reached the root and the depth is 1.
    if (Slotable.isSlotable(node)) {
      return node
        .assignedSlot()
        .map(getDepth)
        .getOr(node.parent().map(getDepth).getOr(1));
    }

    // Otherwise, just go to the parent, if none, this is the toplevel root.
    return node.parent().map(getDepth).getOr(1);
  });
}
