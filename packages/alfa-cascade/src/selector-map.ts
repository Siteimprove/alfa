import { Device } from "@siteimprove/alfa-device";
import {
  Declaration,
  Element,
  Rule,
  StyleRule,
  Sheet,
  MediaRule,
  ImportRule,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Media } from "@siteimprove/alfa-media";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Selector } from "@siteimprove/alfa-selector";

import { UserAgent } from "./user-agent";
import { AncestorFilter } from "./ancestor-filter";

const { equals, property } = Predicate;
const { and } = Refinement;

const isDescendantSelector = and(
  Selector.isComplex,
  property(
    "combinator",
    equals(Selector.Combinator.Descendant, Selector.Combinator.DirectDescendant)
  )
);

/**
 * Cascading origins defined in ascending order; origins defined first have
 * lower precedence than origins defined later.
 *
 * @see https://www.w3.org/TR/css-cascade/#cascading-origins
 *
 * @internal
 */
export enum Origin {
  /**
   * @see https://www.w3.org/TR/css-cascade/#cascade-origin-ua
   */
  UserAgent = 1,

  /**
   * @see https://www.w3.org/TR/css-cascade/#cascade-origin-author
   */
  Author = 2,
}

/**
 * The selector map is a data structure used for providing indexed access to the
 * rules that are likely to match a given element. Rules are indexed according
 * to their key selector, which is the selector that a given element MUST match
 * in order for the rest of the selector to also match. A key selector can be
 * either an ID selector, a class selector, or a type selector. In a relative
 * selector, the key selector will be the right-most selector, e.g. given
 * `main .foo + div` the key selector would be `div`. In a compound selector,
 * the key selector will be left-most selector, e.g. given `div.foo` the key
 * selector would also be `div`.
 *
 * Internally, the selector map has three maps and a list in one of which it
 * will store a given selector. The three maps are used for selectors for which
 * a key selector exist; one for ID selectors, one for class selectors, and one
 * for type selectors. The list is used for any remaining selectors. When
 * looking up the rules that match an element, the ID, class names, and type of
 * the element are used for looking up potentially matching selectors in the
 * three maps. Selector matching is then performed against this list of
 * potentially matching selectors, plus the list of remaining selectors, in
 * order to determine the final set of matches.
 *
 * @see http://doc.servo.org/style/selector_map/struct.SelectorMap.html
 * @internal
 */
export class SelectorMap {
  public static of(sheets: Iterable<Sheet>, device: Device): SelectorMap {
    return new SelectorMap(sheets, device);
  }

  private readonly _ids = Bucket.empty();
  private readonly _classes = Bucket.empty();
  private readonly _types = Bucket.empty();
  private readonly _other: Array<SelectorMap.Node> = [];

  private constructor(sheets: Iterable<Sheet>, device: Device) {
    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order = 0;

    const visit = (rule: Rule) => {
      if (StyleRule.isStyle(rule)) {
        // Style rules with empty style blocks aren't relevant and so can be
        // skipped entirely.
        if (rule.style.isEmpty()) {
          return;
        }

        for (const selector of Selector.parse(rule.selector)) {
          const origin = rule.owner.includes(UserAgent)
            ? Origin.UserAgent
            : Origin.Author;

          order++;

          for (const part of selector) {
            this._add(rule, part, rule.style, origin, order);
          }
        }
      }

      // For media rules, we recurse into the child rules if and only if the
      // media condition matches the device.
      else if (MediaRule.isMedia(rule)) {
        const query = Media.parse(rule.condition);

        if (query.none((query) => query.matches(device))) {
          return;
        }

        for (const child of rule.children()) {
          visit(child);
        }
      }

      // For import rules, we recurse into the imported style sheet if and only
      // if the import condition matches the device.
      else if (ImportRule.isImport(rule)) {
        const query = Media.parse(rule.condition);

        if (query.none((query) => query.matches(device))) {
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
        const query = Media.parse(sheet.condition.get());

        if (query.isNone() || !query.get().matches(device)) {
          continue;
        }
      }

      for (const rule of sheet.children()) {
        visit(rule);
      }
    }
  }

  public get(
    element: Element,
    filter?: AncestorFilter
  ): Array<SelectorMap.Node> {
    const nodes: Array<SelectorMap.Node> = [];

    const collect = (candidates: Iterable<SelectorMap.Node>) => {
      for (const node of candidates) {
        if (
          filter !== undefined &&
          Iterable.every(
            node.selector,
            and(isDescendantSelector, (selector) =>
              canReject(selector.left, filter)
            )
          )
        ) {
          continue;
        }

        if (node.selector.matches(element)) {
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

  private _add(
    rule: Rule,
    selector: Selector,
    declarations: Iterable<Declaration>,
    origin: Origin,
    order: number
  ): void {
    const keySelector = getKeySelector(selector);

    const node = SelectorMap.Node.of(
      rule,
      selector,
      declarations,
      origin,
      order
    );

    for (const selector of keySelector) {
      if (selector instanceof Selector.Id) {
        this._ids.add(selector.name, node);
      }

      if (selector instanceof Selector.Class) {
        this._classes.add(selector.name, node);
      }

      if (selector instanceof Selector.Type) {
        this._types.add(selector.name, node);
      }

      return;
    }

    this._other.push(node);
  }
}

/**
 * @internal
 */
export namespace SelectorMap {
  export class Node {
    public static of(
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      origin: Origin,
      order: number
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
      order: number
    ) {
      this._rule = rule;
      this._selector = selector;
      this._declarations = declarations;
      this._origin = origin;
      this._order = order;
      this._specificity = getSpecificity(selector);
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
  }
}

class Bucket {
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
}

/**
 * Given a selector, get the right-most ID, class, or type selector, i.e. the
 * key selector. If the right-most selector is a compound selector, then the
 * left-most ID, class, or type selector of the compound selector is returned.
 */
function getKeySelector(
  selector: Selector
): Option<Selector.Id | Selector.Class | Selector.Type> {
  if (
    selector instanceof Selector.Id ||
    selector instanceof Selector.Class ||
    selector instanceof Selector.Type
  ) {
    return Option.of(selector);
  }

  if (selector instanceof Selector.Compound) {
    return getKeySelector(selector.left).orElse(() =>
      getKeySelector(selector.right)
    );
  }

  if (selector instanceof Selector.Complex) {
    return getKeySelector(selector.right);
  }

  return None;
}

type Specificity = number;

// The number of bits to use for every component of the specificity computation.
// As bitwise operations in JavaScript are limited to 32 bits, we can only use
// at most 10 bits per component as 3 components are used.
const componentBits = 10;

// The maximum value that any given component can have. Since we can only use 10
// bits for every component, this in effect means that any given component count
// must be strictly less than 1024.
const componentMax = (1 << componentBits) - 1;

/**
 * @see https://www.w3.org/TR/selectors/#specificity
 */
function getSpecificity(selector: Selector): Specificity {
  let a = 0;
  let b = 0;
  let c = 0;

  const queue: Array<Selector> = [selector];

  while (queue.length > 0) {
    const selector = queue.pop();

    if (selector === undefined) {
      break;
    }

    if (selector instanceof Selector.Id) {
      a++;
    } else if (
      selector instanceof Selector.Class ||
      selector instanceof Selector.Attribute ||
      selector instanceof Selector.Pseudo.Class
    ) {
      b++;
    } else if (
      selector instanceof Selector.Type ||
      selector instanceof Selector.Pseudo.Element
    ) {
      c++;
    } else if (
      selector instanceof Selector.Compound ||
      selector instanceof Selector.Complex
    ) {
      queue.push(selector.left, selector.right);
    }
  }

  // Concatenate the components to a single number indicating the specificity of
  // the selector. This allows us to treat specificities as simple numbers and
  // hence use normal comparison operators when comparing specificities.
  return (
    (Math.min(a, componentMax) << (componentBits * 2)) |
    (Math.min(b, componentMax) << (componentBits * 1)) |
    Math.min(c, componentMax)
  );
}

/**
 * Check if a selector can be rejected based on an ancestor filter.
 */
function canReject(selector: Selector, filter: AncestorFilter): boolean {
  if (
    selector instanceof Selector.Id ||
    selector instanceof Selector.Class ||
    selector instanceof Selector.Type
  ) {
    return !filter.matches(selector);
  }

  if (selector instanceof Selector.Compound) {
    // Compound selectors are right-leaning, so recurse to the left first as it
    // is likely the shortest branch.
    return (
      canReject(selector.left, filter) || canReject(selector.right, filter)
    );
  }

  if (selector instanceof Selector.Complex) {
    const { combinator } = selector;

    if (
      combinator === Selector.Combinator.Descendant ||
      combinator === Selector.Combinator.DirectDescendant
    ) {
      // Complex selectors are left-leaning, so recurse to the right first as it
      // is likely the shortest branch.
      return (
        canReject(selector.right, filter) || canReject(selector.left, filter)
      );
    }
  }

  return false;
}
