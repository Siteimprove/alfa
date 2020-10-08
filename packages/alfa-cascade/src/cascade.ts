import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node, Shadow } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
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

    const filter = AncestorFilter.empty();

    const visit = (node: Node): void => {
      if (Element.isElement(node)) {
        this.get(node);
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
    context: Context = Context.empty()
  ): Option<RuleTree.Node> {
    return this._entries
      .get(element, Cache.empty)
      .get(context, () =>
        this._rules.add(sort(this._selectors.get(element, context)))
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
 * Perform an in-place insertion sort of an array of selector entries. Since
 * insertion sort performs well on small arrays compared to other sorting
 * algorithms, it's a good choice for sorting selector entries during cascade
 * as the number of declarations that match an element will more often than not
 * be relatively small.
 *
 * @see https://en.wikipedia.org/wiki/Insertion_sort
 */
function sort(selectors: Array<SelectorMap.Node>): Array<SelectorMap.Node> {
  for (let i = 0, n = selectors.length; i < n; i++) {
    const a = selectors[i];

    let j = i - 1;

    while (j >= 0) {
      const b = selectors[j];

      // If the origins of the rules are not equal, the origin of the rules
      // will determine the cascade.
      if (a.origin !== b.origin && a.origin > b.origin) {
        break;
      }

      // If the specificities of the rules are equal, the declaration order
      // will determine the cascade.
      if (a.specificity === b.specificity && a.order > b.order) {
        break;
      }

      // Otherwise, the specificity will determine the cascade.
      if (a.specificity > b.specificity) {
        break;
      }

      selectors[j + 1] = selectors[j--];
    }

    selectors[j + 1] = a;
  }

  return selectors;
}
