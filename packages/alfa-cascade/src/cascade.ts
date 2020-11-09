import { Cache } from "@siteimprove/alfa-cache";
import { Comparer } from "@siteimprove/alfa-comparable";
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
 * @see https://drafts.csswg.org/css-cascade/
 */
export class Cascade implements Serializable {
  private static readonly _cascades = Cache.empty<
    Document | Shadow,
    Cache<Device, Cascade>
  >();

  public static of(node: Document | Shadow, device: Device): Cascade {
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
    Cache<Context, Option<RuleTree.Node>>
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
        this.get(node, context, Option.of(filter));
        filter.add(node);
      }

      for (const child of node.children()) {
        visit(child);
      }

      if (Element.isElement(node)) {
        filter.remove(node);
      }
    };

    visit(root);
  }

  public get(
    element: Element,
    context: Context = Context.empty(),
    filter: Option<AncestorFilter> = None
  ): Option<RuleTree.Node> {
    return this._entries
      .get(element, Cache.empty)
      .get(context, () =>
        this._rules.add(
          this._selectors.get(element, context, filter).sort(compare)
        )
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

export namespace Cascade {
  export interface JSON {
    [key: string]: json.JSON;
    root: Document.JSON | Shadow.JSON;
    device: Device.JSON;
    selectors: SelectorMap.JSON;
    rules: RuleTree.JSON;
  }
}

/**
 * @see https://drafts.csswg.org/css-cascade/#cascade-sort
 */
const compare: Comparer<SelectorMap.Node> = (a, b) => {
  // First priority: Origin
  if (a.origin !== b.origin) {
    return a.origin < b.origin ? -1 : a.origin > b.origin ? 1 : 0;
  }

  // Second priority: Specificity.
  if (a.specificity !== b.specificity) {
    return a.specificity < b.specificity
      ? -1
      : a.specificity > b.specificity
      ? 1
      : 0;
  }

  // Third priority: Order.
  return a.order < b.order ? -1 : a.order > b.order ? 1 : 0;
};
