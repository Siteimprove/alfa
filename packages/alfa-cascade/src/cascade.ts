import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node, Shadow } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import { Context } from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

import { AncestorFilter } from "./ancestor-filter";
import { RuleTree } from "./rule-tree";
import { SelectorMap } from "./selector-map";
import { UserAgent } from "./user-agent";

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
 * For specific contexts, we only add the nodes in the rule tree as needed. We assume
 * that we mostly query only a few elements in a specific context, and that the cost
 * of rebuilding a full cascade would be too expensive.
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
  private readonly _device: Device;
  private readonly _selectors: SelectorMap;
  private readonly _rules = RuleTree.empty();

  private readonly _entries = Cache.empty<
    Element,
    Cache<Context, RuleTree.Node>
  >();

  private constructor(root: Document | Shadow, device: Device) {
    this._root = root;
    this._device = device;
    this._selectors = SelectorMap.from([UserAgent, ...root.style], device);

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
          .get(context, () =>
            this._rules.add(
              this._selectors.get(node, context, filter),
              node.style,
            ),
          );
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
   * Adds an element to the tree, with a custom ancestor filter.
   *
   * @remarks
   * A new ancestor filter is built and filled with the element's ancestors.
   * When building the full cascade for a DOM tree, this is pointless as we can
   * just build the filter on the go during DOM tree traversal. When looking up
   * the style of a single element, we assume that the time spent going up the
   * DOM tree to build an ancestor filter will be saved by matching fewer
   * selectors.
   */
  private add(element: Element, context: Context): RuleTree.Node {
    const filter = AncestorFilter.empty();
    // Because CSS selectors do not cross shadow or document boundaries,
    // only get ancestors in the same tree.
    // Adding elements to the ancestor filter is commutative, so we
    // can add them from bottom to root without reversing the sequence first.
    element
      .ancestors()
      .filter(Element.isElement)
      .forEach(filter.add.bind(filter));

    return this._rules.add(
      this._selectors.get(element, context, filter),
      element.style,
    );
  }

  /**
   * Get the rule tree node associated with an element.
   *
   * @remarks
   * This also adds the element to the rule tree if needed. That is, the rule
   * tree is build lazily upon need. For the empty context, we pre-build the full
   * tree, so we can benefit from an ancestor filter as we traverse the full DOM tree.
   *
   * For other contexts, we assume that we will only need the style of a few elements
   * (e.g., when a link is focused we normally only need the style of the link itself).
   * Therefore, pre-building the full tree is not worth the cost.
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
      () => this.add(element, context),
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
