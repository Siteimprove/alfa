import { Lexer } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import {
  Declaration,
  Element,
  ImportRule,
  MediaRule,
  Rule,
  Sheet,
  StyleRule,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Media } from "@siteimprove/alfa-media";
import { Option } from "@siteimprove/alfa-option";
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
import { Origin, type Precedence } from "./precedence";
import { UserAgent } from "./user-agent";

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
 * The selector map is a data structure used for providing indexed access to the
 * rules that are likely to match a given element.
 *
 * @remarks
 * Rules are indexed according to their key selector, which is the selector
 * that a given element MUST match in order for the rest of the selector to also
 * match. A key selector can be either an ID selector, a class selector, or a
 * type selector. In a relative selector, the key selector will be the
 * right-most selector, e.g. given `main .foo + div` the key selector would be
 * `div`. In a compound selector, the key selector will be left-most selector,
 * e.g. given `div.foo` the key selector would also be `div`.
 *
 * Any element matching a selector must match its key selector. E.g., anything
 * matching `main .foo + div` must be a `div`. Reciprocally, a `<div class"bar">`
 * can only match selectors whose key selector is `div` or `bar`. Thus, filtering
 * on key selectors decrease the search space for matching selector before the
 * computation heavy steps of traversing the DOM to loo for siblings or ancestors.
 *
 * @privateRemarks
 * Internally, the selector map has three maps and a list in one of which it
 * will store a given selector. The three maps are used for selectors for which
 * a key selector exist; one for ID selectors, one for class selectors, and one
 * for type selectors. The list is used for any remaining selectors (e.g.,
 * pseudo-classes and -elements selectors have no key selector). When looking
 * up the rules that match an element, the ID, class names, and type of the
 * element are used for looking up potentially matching selectors in the three
 * maps. Selector matching is then performed against this list of potentially
 * matching selectors, plus the list of remaining selectors, in order to
 * determine the final set of matches.
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
    other: Array<SelectorMap.Node>,
  ): SelectorMap {
    return new SelectorMap(ids, classes, types, other);
  }

  private readonly _ids: SelectorMap.Bucket;
  private readonly _classes: SelectorMap.Bucket;
  private readonly _types: SelectorMap.Bucket;
  private readonly _other: Array<SelectorMap.Node>;

  private constructor(
    ids: SelectorMap.Bucket,
    classes: SelectorMap.Bucket,
    types: SelectorMap.Bucket,
    other: Array<SelectorMap.Node>,
  ) {
    this._ids = ids;
    this._classes = classes;
    this._types = types;
    this._other = other;
  }

  public get(
    element: Element,
    context: Context,
    filter: Option<AncestorFilter>,
  ): Array<SelectorMap.Node> {
    const nodes: Array<SelectorMap.Node> = [];

    const collect = (candidates: Iterable<SelectorMap.Node>) => {
      for (const node of candidates) {
        if (
          filter.none((filter) =>
            Iterable.every(
              node.selector,
              and(isDescendantSelector, (selector) =>
                filter.canReject(selector.left),
              ),
            ),
          ) &&
          node.selector.matches(element, context)
        ) {
          nodes.push(node);
        }
      }
    };

    for (const id of element.id) {
      collect(this._ids.get(id));
    }

    collect(this._types.get(element.name));

    for (const className of element.classes) {
      collect(this._classes.get(className));
    }

    collect(this._other);

    return nodes;
  }

  public toJSON(): SelectorMap.JSON {
    return {
      ids: this._ids.toJSON(),
      classes: this._classes.toJSON(),
      types: this._types.toJSON(),
      other: this._other.map((node) => node.toJSON()),
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
    other: Array<Node.JSON>;
  }

  export function from(sheets: Iterable<Sheet>, device: Device): SelectorMap {
    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order = 0;

    const ids = Bucket.empty();
    const classes = Bucket.empty();
    const types = Bucket.empty();
    const other: Array<Node> = [];

    const add = (
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      { origin, order }: Precedence,
    ): void => {
      const node = Node.of(rule, selector, declarations, origin, order);

      const keySelector = selector.key;

      if (!keySelector.isSome()) {
        other.push(node);
      } else {
        const key = keySelector.get();
        const buckets = { id: ids, class: classes, type: types };
        buckets[key.type].add(key.name, node);
      }
    };

    const visit = (rule: Rule) => {
      if (StyleRule.isStyleRule(rule)) {
        // Style rules with empty style blocks aren't relevant and so can be
        // skipped entirely.
        if (rule.style.isEmpty()) {
          return;
        }

        for (const [, selector] of Selector.parse(Lexer.lex(rule.selector))) {
          const origin = rule.owner.includes(UserAgent)
            ? Origin.UserAgent
            : Origin.Author;

          order++;

          for (const part of selector) {
            add(rule, part, rule.style, {
              origin,
              order,
              specificity: selector.specificity,
            });
          }
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
        const query = Media.parse(Lexer.lex(sheet.condition.get()));

        if (query.every(([, query]) => !query.matches(device))) {
          continue;
        }
      }

      for (const rule of sheet.children()) {
        visit(rule);
      }
    }

    return SelectorMap.of(ids, classes, types, other);
  }

  export class Node implements Serializable {
    public static of(
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      origin: Origin,
      order: number,
    ): Node {
      return new Node(rule, selector, declarations, origin, order);
    }

    private readonly _rule: Rule;
    private readonly _selector: Selector;
    private readonly _declarations: Iterable<Declaration>;
    private readonly _origin: Origin;
    private readonly _order: number;
    private readonly _specificity: number;

    private constructor(
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      origin: Origin,
      order: number,
    ) {
      this._rule = rule;
      this._selector = selector;
      this._declarations = declarations;
      this._origin = origin;
      this._order = order;

      // For style rules that are presentational hints, the specificity will
      // always be 0 regardless of the selector.
      // Otherwise, use the specificity of the selector.
      this._specificity =
        StyleRule.isStyleRule(rule) && rule.hint
          ? 0
          : selector.specificity.value;
    }

    public get rule(): Rule {
      return this._rule;
    }

    public get selector(): Selector {
      return this._selector;
    }

    public get declarations(): Iterable<Declaration> {
      return this._declarations;
    }

    public get origin(): Origin {
      return this._origin;
    }

    public get order(): number {
      return this._order;
    }

    public get specificity(): number {
      return this._specificity;
    }

    public toJSON(): Node.JSON {
      return {
        rule: this._rule.toJSON(),
        selector: this._selector.toJSON(),
        declarations: [...this._declarations].map((declaration) =>
          declaration.toJSON(),
        ),
        origin: this._origin,
        order: this._order,
        specificity: this._specificity,
      };
    }
  }

  export namespace Node {
    export interface JSON {
      [key: string]: json.JSON;
      rule: Rule.JSON;
      selector: Selector.JSON;
      declarations: Array<Declaration.JSON>;
      origin: Origin;
      order: number;
      specificity: number;
    }
  }

  export class Bucket implements Serializable {
    public static empty(): Bucket {
      return new Bucket(new Map());
    }

    private readonly _nodes: Map<string, Array<SelectorMap.Node>>;

    private constructor(nodes: Map<string, Array<SelectorMap.Node>>) {
      this._nodes = nodes;
    }

    public add(key: string, node: SelectorMap.Node): void {
      const nodes = this._nodes.get(key);

      if (nodes === undefined) {
        this._nodes.set(key, [node]);
      } else {
        nodes.push(node);
      }
    }

    public get(key: string): Array<SelectorMap.Node> {
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

  export namespace Bucket {
    export type JSON = Array<[string, Array<SelectorMap.Node.JSON>]>;
  }
}
