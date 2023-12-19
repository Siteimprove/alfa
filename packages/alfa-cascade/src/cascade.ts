import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node, Shadow } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
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

  /**
   * Unsafely create a cascade.
   *
   * @remarks
   * This doesn't check coupling of data. This stores a cache that can still be
   * accessed (and modified) from outside. This is only useful for writing tests
   * without including the User Agent style sheet in the cascade.
   *
   * Do not use. Use Cascade.from() instead. Seriously.
   *
   * @internal
   */
  public static of(
    root: Document | Shadow,
    device: Device,
    selectors: SelectorMap,
    rules: RuleTree,
    entries: Cache<Element, Cache<Context, RuleTree.Node>>,
  ): Cascade {
    return new Cascade(root, device, selectors, rules, entries);
  }

  /**
   * Build a cascade.
   *
   * @privateRemarks
   * This needs to be here rather than in the namespace because it also updates
   * the global cascades cache.
   */
  public static from(root: Document | Shadow, device: Device): Cascade {
    // Caching all existing cascade since we need to maintain one for each
    // document or shadow tree.
    return this._cascades.get(root, Cache.empty).get(device, () => {
      // Build a selector map with the User Agent style sheet, and the root style sheets.
      const selectors = SelectorMap.from([UserAgent, ...root.style], device);
      const rules = RuleTree.empty();
      const entries = Cache.empty<Element, Cache<Context, RuleTree.Node>>();

      // Perform a baseline cascade with an empty context to benefit from ancestor
      // filtering. As getting style information with an empty context will be the
      // common case, we benefit a lot from pre-computing this style information
      // with an ancestor filter applied.
      const context = Context.empty();
      const filter = AncestorFilter.empty();

      const visit = (node: Node): void => {
        if (Element.isElement(node)) {
          // Since we are traversing the full DOM tree and maintaining our own
          // ancestor filter on the way, use the simple #add.

          // Entering an element: add it to the rule tree, and to the ancestor filter.
          entries
            .get(node, Cache.empty)
            .get(context, () =>
              rules.add(selectors.get(node, context, Option.of(filter))),
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

      return Cascade.of(root, device, selectors, rules, entries);
    });
  }

  // root and device used to build the cascade. These are only kept for debugging
  // purpose, since they are not really used after the cascade is built.
  private readonly _root: Document | Shadow;
  private readonly _device: Device;
  // Selector map of all selectors in the User Agent style sheet and the root style sheets.
  private readonly _selectors: SelectorMap;
  // Rule tree, built incrementally upon need.
  private readonly _rules: RuleTree;

  // Map from elements (and contexts) to nodes in the rule tree.
  private readonly _entries: Cache<Element, Cache<Context, RuleTree.Node>>;

  private constructor(
    root: Document | Shadow,
    device: Device,
    selectors: SelectorMap,
    rules: RuleTree,
    entries: Cache<Element, Cache<Context, RuleTree.Node>>,
  ) {
    this._root = root;
    this._device = device;
    // Build a selector map with the User Agent style sheet, and the root style sheets.
    this._selectors = selectors;
    this._rules = rules;
    this._entries = entries;
  }

  /**
   * Add an element to the rule tree, returns the associated node.
   *
   * @remarks
   * This is idempotent since the rule tree already checks physical identity
   * of selectors upon insertion. However, calling it too often is bad for performance.
   */
  private add(
    element: Element,
    context: Context = Context.empty(),
    filter: Option<AncestorFilter> = None,
  ): RuleTree.Node {
    // We want to update the cache and therefore rely on the ifMissing mechanism
    // of its getter.
    return this._entries
      .get(element, Cache.empty)
      .get(context, () =>
        this._rules.add(this._selectors.get(element, context, filter)),
      );
  }

  /**
   * Adds an element to the tree, with a custom ancestor filter.
   *
   * @remarks
   * A new ancestor filter is built and filled with the element's ancestors.
   * When building the full cascade for a DOM tree, this is pointless and the
   * faster #add should be used instead. When looking up the style of a single
   * element, we assume shat the time spend going up the DOM tree to build an
   * ancestor filter will be saved by matching less selectors.
   */
  private addAncestors(element: Element, context: Context): RuleTree.Node {
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
      this._selectors.get(element, context, Option.of(filter)),
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
   * Therefore, pre-building the full tree is not worth the cost nor the saving we'd
   * get with an ancestor filter.
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
      () => this.addAncestors(element, context),
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
