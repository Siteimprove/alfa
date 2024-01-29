import { Array } from "@siteimprove/alfa-array";
import { Lexer } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  ImportRule,
  MediaRule,
  Rule,
  Sheet,
  StyleRule,
  SupportsRule,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import {
  Combinator,
  Complex,
  Context,
  Selector,
} from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

import { AncestorFilter } from "./ancestor-filter";
import { Block } from "./block";
import { type Order } from "./precedence";

const { equals, property } = Predicate;
const { and } = Refinement;

const { isComplex } = Complex;

const isDescendantSelector = and(
  isComplex,
  property(
    "combinator",
    equals(Combinator.Descendant, Combinator.DirectDescendant),
  ),
);

/**
 * The selector map is a data structure used for providing indexed access to
 * the rules that are likely to match a given element.
 *
 * @remarks
 * Rules are indexed according to their key selector, which is the selector
 * that a given element MUST match in order for the rest of the selector to also
 * match. A key selector can be either an ID selector, a class selector, or a
 * type selector. In a complex selector, the key selector will be the
 * right-most selector, e.g. given `main .foo + div` the key selector would be
 * `div`. In a compound selector, the key selector will be left-most selector,
 * e.g. given `div.foo` the key selector would also be `div`.
 *
 * Any element matching a selector must match its key selector. E.g., anything
 * matching `main .foo + div` must be a `div`. Reciprocally, a
 * `<div class="bar">` can only match selectors whose key selector is `div` or
 * `.bar`. Thus, filtering on key selectors decrease the search space for
 * matching selector before the computation heavy steps of traversing the DOM
 * to look for siblings or ancestors.
 *
 * @privateRemarks
 * Internally, the selector map has three maps and two lists in one of which it
 * will store a given selector.
 * * The three maps are used for selectors for which a key selector exist;
 *   one for ID selectors, one for class selectors, and one for type selectors.
 * * The first list is used for any remaining selectors (e.g., pseudo-classes
 *   and -elements selectors have no key selector).
 * * The second list is used for the special shadow selectors that can select
 *   into the light tree. These should never be matched against elements of the
 *   same tree, but against the host tree.
 *
 * When looking up the rules that match an element, the ID, class names, and
 * type of the element are used for looking up potentially matching selectors
 * in the three maps. Selector matching is then performed against this list
 * of potentially matching selectors, plus the list of remaining selectors,
 * in order to determine the final set of matches.
 *
 * {@link http://doc.servo.org/style/selector_map/struct.SelectorMap.html}
 *
 * @internal
 */
export class SelectorMap implements Serializable {
  public static of(
    ids: SelectorMap.Bucket,
    classes: SelectorMap.Bucket,
    types: SelectorMap.Bucket,
    other: Array<Block<Block.Source>>,
    shadow: Array<Block<Block.Source>>,
  ): SelectorMap {
    return new SelectorMap(ids, classes, types, other, shadow);
  }

  private readonly _ids: SelectorMap.Bucket;
  private readonly _classes: SelectorMap.Bucket;
  private readonly _types: SelectorMap.Bucket;
  private readonly _other: Array<Block<Block.Source>>;
  private readonly _shadow: Array<Block<Block.Source>>;

  private constructor(
    ids: SelectorMap.Bucket,
    classes: SelectorMap.Bucket,
    types: SelectorMap.Bucket,
    other: Array<Block<Block.Source>>,
    shadow: Array<Block<Block.Source>>,
  ) {
    this._ids = ids;
    this._classes = classes;
    this._types = types;
    this._other = other;
    this._shadow = shadow;
  }

  /**
   * Get all blocks matching a given element and context, an optional
   * ancestor filter can be provided to optimize performances.
   */
  public *get(
    element: Element,
    context: Context,
    filter: AncestorFilter,
  ): Iterable<Block<Block.Source>> {
    function* collect(
      candidates: Iterable<Block<Block.Source>>,
    ): Iterable<Block<Block.Source>> {
      for (const block of candidates) {
        // If the ancestor filter can reject the selector, escape
        if (
          isDescendantSelector(block.selector) &&
          filter.canReject(block.selector.left)
        ) {
          continue;
        }

        // otherwise, do the actual match.
        if (block.selector.matches(element, context)) {
          yield block;
        }
      }
    }

    for (const id of element.id) {
      yield* collect(this._ids.get(id));
    }

    yield* collect(this._types.get(element.name));

    for (const className of element.classes) {
      yield* collect(this._classes.get(className));
    }

    yield* collect(this._other);
  }

  /**
   * Get all blocks from the "shadow" selectors that match a shadow host.
   *
   * @remarks
   * The host must be the shadow host of the tree whose style sheets define
   * this selector map.
   *
   * @privateRemarks
   * Because `:host-context` is searching for shadow-including ancestors of the
   * host, we cannot use the ancestor filter that does not escape its tree.
   * This is therefore fairly costly, and hopefully not too frequent.
   */
  public *getForHost(
    host: Element,
    context: Context,
  ): Iterable<Block<Block.Source>> {
    yield* this._shadow.filter(
      (block) =>
        Selector.isHostSelector(block.selector) &&
        block.selector.matchHost(host, context),
    );
  }

  /**
   * Get all blocks from the "shadow" selectors that match a slotted element.
   *
   * @remarks
   * `slotted` should be a light node slotted in the tree whose style sheets
   * define this selector map. If this is not the case, all matches will fail.
   *
   * @privateRemarks
   * Because this navigates (partly) in the flat tree rather than the normal DOM
   * tree, we cannot easily re-use the ancestor filter.
   */
  public *getForSlotted(
    slotted: Element,
    context: Context,
    debug: boolean = false,
  ): Iterable<Block<Block.Source>> {
    yield* this._shadow.filter((block) => {
      return (
        Selector.hasSlotted(block.selector) &&
        Selector.matchSlotted(block.selector, slotted, context)
      );
    });
  }

  public toJSON(): SelectorMap.JSON {
    return {
      ids: this._ids.toJSON(),
      classes: this._classes.toJSON(),
      types: this._types.toJSON(),
      other: this._other.map((node) => node.toJSON()),
      shadow: this._shadow.map((node) => node.toJSON()),
    };
  }
}

/**
 * @internal
 */
export namespace SelectorMap {
  export interface JSON {
    [key: string]: json.JSON;
    ids: Bucket.JSON;
    classes: Bucket.JSON;
    types: Bucket.JSON;
    other: Array<Block.JSON>;
    shadow: Array<Block.JSON>;
  }

  export function from(
    sheets: Iterable<Sheet>,
    device: Device,
    encapsulationDepth: number,
  ): SelectorMap {
    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order: Order = 0;

    const ids = Bucket.empty();
    const classes = Bucket.empty();
    const types = Bucket.empty();
    const other: Array<Block<Block.Source>> = [];
    const shadow: Array<Block<Block.Source>> = [];

    const add = (block: Block<Block.Source>): void => {
      const keySelector = block.selector.key;

      if (!keySelector.isSome()) {
        if (Selector.isShadow(block.selector)) {
          // These selectors select nodes in the light tree, they are stored
          // separately and need to be checked when building the cascade of
          // the hosting tree, not of the same tree.
          shadow.push(block);
        } else {
          other.push(block);
        }
      } else {
        const key = keySelector.get();
        const buckets = { id: ids, class: classes, type: types };
        buckets[key.type].add(key.name, block);
      }
    };

    const visit = (rule: Rule) => {
      // For style rule, we just store its blocks.
      if (StyleRule.isStyleRule(rule)) {
        // Style rules with empty style blocks aren't relevant and so can be
        // skipped entirely.
        if (rule.style.isEmpty()) {
          return;
        }

        let blocks: Array<Block<Block.Source>> = [];
        [blocks, order] = Block.from(rule, order, encapsulationDepth);

        for (const block of blocks) {
          add(block);
        }
      }

      // For media rules, we recurse into the child rules if and only if the
      // media condition matches the device.
      else if (MediaRule.isMediaRule(rule)) {
        if (!rule.queries.matches(device)) {
          return;
        }

        for (const child of rule.children()) {
          visit(child);
        }
      }

      // For import rules, we recurse into the imported style sheet if and only
      // if the import condition matches the device.
      else if (ImportRule.isImportRule(rule)) {
        if (!rule.queries.matches(device)) {
          return;
        }

        for (const child of rule.sheet.children()) {
          visit(child);
        }
      } else if (SupportsRule.isSupportsRule(rule)) {
        if (rule.query.every((query) => !query.matches(device))) {
          // If the option is None, the condition failed to parse and the rule is discarded.
          return;
        }

        for (const child of rule.children()) {
          visit(child);
        }
      }

      // Otherwise, we recurse into whichever child rules are declared by the
      // current rule.
      else {
        for (const child of rule.children()) {
          visit(child);
        }
      }
    };

    for (const sheet of sheets) {
      if (sheet.disabled) {
        continue;
      }

      if (sheet.condition.isSome()) {
        const query = Feature.parseMediaQuery(Lexer.lex(sheet.condition.get()));

        if (query.every(([, query]) => !query.matches(device))) {
          continue;
        }
      }

      for (const rule of sheet.children()) {
        visit(rule);
      }
    }

    return SelectorMap.of(ids, classes, types, other, shadow);
  }

  /**
   * @remarks
   * Selector maps only store selectors from rules, not style attribute.
   * So, they always receive Blocks with a Source.
   *
   * @internal
   */
  export class Bucket implements Serializable {
    public static empty(): Bucket {
      return new Bucket(new Map());
    }

    private readonly _nodes: Map<string, Array<Block<Block.Source>>>;

    private constructor(nodes: Map<string, Array<Block<Block.Source>>>) {
      this._nodes = nodes;
    }

    public add(key: string, node: Block<Block.Source>): void {
      const nodes = this._nodes.get(key);

      if (nodes === undefined) {
        this._nodes.set(key, [node]);
      } else {
        nodes.push(node);
      }
    }

    public get(key: string): Array<Block<Block.Source>> {
      const nodes = this._nodes.get(key);

      if (nodes === undefined) {
        return [];
      }

      return nodes;
    }

    public toJSON(): Bucket.JSON {
      return [...this._nodes].map(([key, nodes]) => [
        key,
        nodes.map((node) => node.toJSON()),
      ]);
    }
  }

  /**
   * @internal
   */
  export namespace Bucket {
    export type JSON = Array<[string, Array<Block.JSON<Block.Source>>]>;
  }
}
