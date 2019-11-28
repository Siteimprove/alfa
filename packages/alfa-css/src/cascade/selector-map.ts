import { Device } from "@siteimprove/alfa-device";
import {
  Declaration,
  Element,
  Rule,
  StyleRule,
  StyleSheet,
  MediaRule
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";

import { Media } from "../media";
import { Selector } from "../selector";
import { UserAgent } from "./user-agent";

/**
 * Cascading origins defined in ascending order; origins defined first have
 * lower precedence than origins defined later.
 *
 * @see https://www.w3.org/TR/css-cascade/#cascading-origins
 *
 * @internal
 */
export const enum Origin {
  /**
   * @see https://www.w3.org/TR/css-cascade/#cascade-origin-ua
   */
  UserAgent = 1,

  /**
   * @see https://www.w3.org/TR/css-cascade/#cascade-origin-author
   */
  Author = 2
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
  private readonly ids = SelectorMap.Bucket.empty();
  private readonly classes = SelectorMap.Bucket.empty();
  private readonly types = SelectorMap.Bucket.empty();
  private readonly other: Array<SelectorMap.Node> = [];

  public constructor(styleSheets: Iterable<StyleSheet>, device: Device) {
    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order = 0;

    const visit = (rule: Rule) => {
      if (MediaRule.isMediaRule(rule)) {
        const query = Media.parse(rule.condition);

        if (query.isNone() || !query.get().matches(device)) {
          return;
        }
      }

      if (StyleRule.isStyleRule(rule)) {
        const selector = Selector.parse(rule.selector);

        if (selector.isNone() || Iterable.isEmpty(rule.style)) {
          return;
        }

        const origin =
          rule.owner === UserAgent ? Origin.UserAgent : Origin.Author;

        order++;

        for (const part of selector.get()) {
          this.add(rule, part, rule.style, origin, order);
        }
      }

      for (const child of rule.visit()) {
        visit(child);
      }
    };

    for (const styleSheet of styleSheets) {
      for (const rule of styleSheet.visit()) {
        visit(rule);
      }
    }
  }

  public get(element: Element): Array<SelectorMap.Node> {
    const nodes: Array<SelectorMap.Node> = [];

    const id = element.id;

    if (id.isSome()) {
      collect(this.ids.get(id.get()));
    }

    collect(this.types.get(element.name));

    for (const className of element.classes) {
      collect(this.classes.get(className));
    }

    collect(this.other);

    return nodes;

    function collect(nodes: Array<SelectorMap.Node>) {
      for (const node of nodes) {
        if (node.selector.matches(element)) {
          nodes.push(node);
        }
      }
    }
  }

  private add(
    rule: Rule,
    selector: Selector,
    declarations: Iterable<Declaration>,
    origin: Origin,
    order: number
  ): void {
    const keySelector = getKeySelector(selector);
    const specificity = getSpecificity(selector);

    const node: SelectorMap.Node = {
      rule,
      selector,
      declarations,
      origin,
      order,
      specificity
    };

    for (const selector of keySelector) {
      if (selector instanceof Selector.Id) {
        this.ids.add(selector.name, node);
      }

      if (selector instanceof Selector.Class) {
        this.classes.add(selector.name, node);
      }

      if (selector instanceof Selector.Type) {
        this.types.add(selector.name, node);
      }

      return;
    }

    this.other.push(node);
  }
}

/**
 * @internal
 */
export namespace SelectorMap {
  export interface Node {
    readonly rule: Rule;
    readonly selector: Selector;
    readonly declarations: Iterable<Declaration>;
    readonly origin: Origin;
    readonly order: number;
    readonly specificity: number;
  }

  export class Bucket {
    public static empty(): Bucket {
      return new Bucket(new Map());
    }

    public readonly nodes: Map<string, Array<Node>>;

    private constructor(nodes: Map<string, Array<Node>>) {
      this.nodes = nodes;
    }

    public add(key: string, node: SelectorMap.Node): void {
      const nodes = this.nodes.get(key);

      if (nodes === undefined) {
        this.nodes.set(key, [node]);
      } else {
        nodes.push(node);
      }
    }

    public get(key: string): Array<SelectorMap.Node> {
      const nodes = this.nodes.get(key);

      if (nodes === undefined) {
        return [];
      }

      return nodes;
    }
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
 *
 * @internal
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
