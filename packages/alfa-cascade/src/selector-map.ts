import { Array } from "@siteimprove/alfa-array";
import { Lexer } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  ImportRule,
  Layer as LayerRules,
  MediaRule,
  Rule,
  Sheet,
  StyleRule,
  SupportsRule,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Maybe } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Selective } from "@siteimprove/alfa-selective";
import {
  Combinator,
  Complex,
  Context,
  Selector,
} from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

import { AncestorFilter } from "./ancestor-filter";
import { Block } from "./block";
import { Layer, type Order } from "./precedence";

const { equals, not, property } = Predicate;
const { and } = Refinement;

const { isComplex } = Complex;
const isDescendantSelector = and(
  isComplex,
  property(
    "combinator",
    equals(Combinator.Descendant, Combinator.DirectDescendant),
  ),
);

const { isImportRule } = ImportRule;
const { isLayerBlockRule } = LayerRules.BlockRule;
const { isLayerStatementRule } = LayerRules.StatementRule;
const { isMediaRule } = MediaRule;
const { isStyleRule } = StyleRule;
const { isSupportsRule } = SupportsRule;

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
   *
   * @remarks
   * Blocks whose layers haven't been ordered are discarded at that point.
   * Under normal flow, this should only be called once layers have been ordered.
   */
  public *get(
    element: Element,
    context: Context,
    filter: AncestorFilter,
  ): Iterable<Block<Block.Source, true>> {
    function* collect(
      candidates: Iterable<Block<Block.Source>>,
    ): Iterable<Block<Block.Source, true>> {
      for (const block of candidates) {
        // If the ancestor filter can reject the selector, escape
        if (
          isDescendantSelector(block.selector) &&
          filter.canReject(block.selector.left)
        ) {
          continue;
        }

        // otherwise, do the actual match.
        if (
          block.precedence.layer.isOrdered &&
          block.selector.matches(element, context)
        ) {
          yield block as Block<Block.Source, true>;
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
   * Blocks whose layers haven't been ordered are discarded at that point.
   * Under normal flow, this should only be called once layers have been ordered.
   *
   * @privateRemarks
   * Because `:host-context` is searching for shadow-including ancestors of the
   * host, we cannot use the ancestor filter that does not escape its tree.
   * This is therefore fairly costly, and hopefully not too frequent.
   */
  public *getForHost(
    host: Element,
    context: Context,
  ): Iterable<Block<Block.Source, true>> {
    yield* this._shadow.filter(
      (block): block is Block<Block.Source, true> =>
        block.precedence.layer.isOrdered &&
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
   * Blocks whose layers haven't been ordered are discarded at that point.
   * Under normal flow, this should only be called once layers have been ordered.
   *
   * @privateRemarks
   * Because this navigates (partly) in the flat tree rather than the normal DOM
   * tree, we cannot easily re-use the ancestor filter.
   */
  public *getForSlotted(
    slotted: Element,
    context: Context,
    debug: boolean = false,
  ): Iterable<Block<Block.Source, true>> {
    yield* this._shadow.filter(
      (block): block is Block<Block.Source, true> =>
        block.precedence.layer.isOrdered &&
        Selector.hasSlotted(block.selector) &&
        Selector.matchSlotted(block.selector, slotted, context),
    );
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

    // Create buckets for storing the rules, based on their key selector.
    const ids = Bucket.empty();
    const classes = Bucket.empty();
    const types = Bucket.empty();
    const buckets = { id: ids, class: classes, type: types };
    const other: Array<Block<Block.Source>> = [];
    const shadow: Array<Block<Block.Source>> = [];

    // We store layers in the order we encounter them. Later on, we will
    // sort them in the correct order. We cannot sort on the fly because
    // un-layered rules come after all layered rules, but the full list of
    // layers is not known until the end.
    // layers are also duplicated by importance of the blocks in them, since
    // it reverses the winner of the cascade.
    // We also maintain a counter for uniquely naming anonymous layers.
    //
    // It is of the uttermost importance that blocks share the same Layer
    // object, since we will laters mutate them to add the correct order.
    const layers: Array<Layer.Pair<false>> = [];
    let anonymousLayers = 0;

    /**
     * Creates a unique name for anonymous layers. Parenthesis and space
     * ensure it doesn't collide with CSS ident used as name for other layers.
     */
    function anonymous(): string {
      anonymousLayers++;
      return `(anonymous ${anonymousLayers})`;
    }

    /**
     * Gets a specific layer, create it if needed.
     */
    function getSingleLayer(name: string): Layer.Pair<false> {
      let layer = layers.find((pair) => pair.name === name);

      if (layer === undefined) {
        layer = {
          name,
          normal: Layer.of(name, false),
          important: Layer.of(name, true),
        };
        layers.push(layer);
      }

      return layer;
    }

    /**
     * Gets the layer for a name, create it and its ancestors if needed.
     *
     * @remarks
     * This is quite inefficient in always getting/creating all ancestors.
     * We could instead assume that the array is path-prefix complete and stop
     * as soon as we encounter an existing ancestor. We assume that both the
     * total number of layers, the depth of the layers tree, and the amount
     * of re-declaration of a layer block rule with an existing layer will
     * be very low, so this is not critical.
     */
    function getLayer(name: string): Layer.Pair<false> {
      // Since it is possible to declare sub-layers without the intermediate
      // ones, we check for all layers on the path and create them if needed.
      let current = "";
      let layer = getSingleLayer(current);

      for (const segment of name.split(".")) {
        // If the current layer name is not empty, add a dot to it;
        current = (current === "" ? "" : `${current}.`) + segment;
        layer = getSingleLayer(current);
      }

      return layer;
    }

    /**
     * Gets the layer obtained by adding a new segment to the current one.
     * Handles shenanigans around the empty implicit layer, and anonymous layers.
     *
     * @remarks
     * The new segment may actually be a dot-separated path, actually creating
     * several intermediate layers.
     */
    function nextLayer(
      current: Layer.Pair<false>,
      segment: Maybe<string>,
    ): Layer.Pair<false> {
      return getLayer(
        // If the current layer name is not empty, add a dot to it;
        (current.name === "" ? "" : `${current.name}.`) +
          // add the new segment, or create an anonymous layer.
          Maybe.toOption(segment).getOrElse(anonymous),
      );
    }

    /**
     * Adds a block to the correct bucket
     */
    function add(block: Block<Block.Source>): void {
      const keySelector = block.selector.key;

      if (Selector.isShadow(block.selector)) {
        // These selectors select nodes in the light tree, they are stored
        // separately and need to be checked when building the cascade of
        // the hosting tree, not of the same tree.
        shadow.push(block);
        return;
      }

      if (!keySelector.isSome()) {
        other.push(block);
        return;
      }

      const key = keySelector.get();
      buckets[key.type].add(key.name, block);
    }

    /**
     * Helpers for visit.
     */
    const skip = () => undefined;
    function visitChildren(
      visitor: (rule: Rule) => void,
    ): (rule: Rule) => void {
      return (rule) => Iterable.forEach(rule.children(), visitor);
    }

    /**
     * Recursively visits a rule and adds its declarations to the correct buckets.
     */
    function visit(layer: Layer.Pair<false>): (rule: Rule) => void {
      return (rule) =>
        Selective.of(rule)
          // For style rules, store its blocks; this is where the actual work happens.
          // Style rules with empty style blocks aren't relevant and so can be
          // skipped entirely to avoid increasing order.
          .if(and(isStyleRule, StyleRule.isEmpty), skip)
          .if(isStyleRule, (rule) => {
            let blocks: Array<Block<Block.Source>> = [];
            [blocks, order] = Block.from(
              rule,
              order,
              encapsulationDepth,
              layer,
            );

            for (const block of blocks) {
              add(block);
            }
          })

          // For import rules, we recurse into the imported style sheet if and only
          // if the import condition matches the device.
          .if(and(isImportRule, not(ImportRule.matches(device))), skip)
          .if(isImportRule, (rule) =>
            Iterable.forEach(rule.sheet.children(), visit(layer)),
          )
          // For layer block rules, we fetch/create the layer and recurse into it.
          .if(isLayerBlockRule, (rule) =>
            visitChildren(visit(nextLayer(layer, rule.layer)))(rule),
          )
          // For layer statement rules, we just fetch/create the layers in order
          .if(isLayerStatementRule, (rule) =>
            Iterable.forEach(rule.layers, (name) => nextLayer(layer, name)),
          )
          // For media rules, we recurse into the child rules if and only if the
          // media condition matches the device.
          .if(and(isMediaRule, not(MediaRule.matches(device))), skip)
          .if(isMediaRule, visitChildren(visit(layer)))
          // For support rules, we recurse into the child rules if and only
          // if the support condition matches the device.
          .if(and(isSupportsRule, not(SupportsRule.matches(device))), skip)
          .if(isSupportsRule, visitChildren(visit(layer)))
          // Otherwise, we recurse into whichever child rules are declared by the
          // current rule.
          .else(visitChildren(visit(layer)));
    }

    // Visit all rules in all sheets.
    for (const sheet of Iterable.reject(sheets, (sheet) => sheet.disabled)) {
      if (sheet.condition.isSome()) {
        // If the sheet is conditional and the query doesn't match, skip the sheet.
        const query = Feature.parseMediaQuery(Lexer.lex(sheet.condition.get()));

        if (query.every(([, query]) => !query.matches(device))) {
          continue;
        }
      }

      // Visit all rules in the sheet, with the top-level implicit layer.
      Iterable.forEach(sheet.children(), visit(getLayer("")));
    }

    // After visiting all rules in all sheets, order the layers.
    // This mutates the layers, thus updating the blocks accordingly.
    Layer.sortUnordered(layers);

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
