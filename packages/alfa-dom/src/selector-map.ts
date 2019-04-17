import {
  Declaration,
  parseDeclaration,
  parseSelector,
  Selector,
  SelectorType
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { fulfills } from "./fulfills";
import { getClassList } from "./get-class-list";
import { getId } from "./get-id";
import { getKeySelector } from "./get-key-selector";
import { getSpecificity } from "./get-specificity";
import { isConditionRule, isStyleRule } from "./guards";
import { matches, MatchesOptions } from "./matches";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { Element, Node, StyleSheet } from "./types";
import { isUserAgentRule } from "./user-agent";

const { isArray } = Array;

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
  UserAgent,

  /**
   * @see https://www.w3.org/TR/css-cascade/#cascade-origin-author
   */
  Author
}

/**
 * @internal
 */
export interface SelectorEntry {
  readonly selector: Selector;
  readonly declarations: ReadonlyArray<Declaration>;
  readonly origin: Origin;
  readonly order: number;
  readonly specificity: number;
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
 *
 * @internal
 */
export class SelectorMap {
  private readonly ids: SelectorBucket = new Map();
  private readonly classes: SelectorBucket = new Map();
  private readonly types: SelectorBucket = new Map();
  private readonly other: Array<SelectorEntry> = [];

  public constructor(styleSheets: ReadonlyArray<StyleSheet>, device: Device) {
    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order = 0;

    // The same declarations are often repeated across several rules, which
    // is especially true for simple declarations such as `display: none`. We
    // can therefore save quite a few roundtrips to the parser by caching and
    // reusing parsed declarations.
    const declarationsCache: Map<string, Array<Declaration>> = new Map();

    for (let i = 0, n = styleSheets.length; i < n; i++) {
      traverseStyleSheet(styleSheets[i], {
        enter: (rule, parentRule, { skip }) => {
          if (isConditionRule(rule) && !fulfills(device, rule)) {
            return skip;
          }

          if (isStyleRule(rule)) {
            const selectors = parseSelectors(rule.selectorText);

            if (selectors.length === 0) {
              return;
            }

            const { cssText } = rule.style;

            let declarations = declarationsCache.get(cssText);

            if (declarations === undefined) {
              declarations = parseDeclarations(cssText);
              declarationsCache.set(cssText, declarations);
            }

            if (declarations.length === 0) {
              return;
            }

            const origin = isUserAgentRule(rule)
              ? Origin.UserAgent
              : Origin.Author;

            order++;

            for (let i = 0, n = selectors.length; i < n; i++) {
              this.addRule(selectors[i], declarations, origin, order);
            }
          }
        }
      });
    }
  }

  public getRules(
    element: Element,
    context: Node,
    options?: MatchesOptions
  ): Array<SelectorEntry> {
    const rules: Array<SelectorEntry> = [];

    function collectEntries(entries: Array<SelectorEntry>) {
      for (let i = 0, n = entries.length; i < n; i++) {
        const entry = entries[i];

        if (matches(element, context, entry.selector, options)) {
          rules.push(entry);
        }
      }
    }

    const id = getId(element);

    if (id !== null) {
      collectEntries(getEntries(this.ids, id));
    }

    collectEntries(getEntries(this.types, element.localName));

    const classList = getClassList(element);

    for (let i = 0, n = classList.length; i < n; i++) {
      collectEntries(getEntries(this.classes, classList[i]));
    }

    collectEntries(this.other);

    return rules;
  }

  private addRule(
    selector: Selector,
    declarations: Array<Declaration>,
    origin: Origin,
    order: number
  ): void {
    const keySelector = getKeySelector(selector);
    const specificity = getSpecificity(selector);

    const entry: SelectorEntry = {
      selector,
      declarations,
      origin,
      order,
      specificity
    };

    if (keySelector === null) {
      this.other.push(entry);
    } else {
      const key = keySelector.name;

      switch (keySelector.type) {
        case SelectorType.IdSelector:
          addEntry(this.ids, key, entry);
          break;
        case SelectorType.ClassSelector:
          addEntry(this.classes, key, entry);
          break;
        case SelectorType.TypeSelector:
          addEntry(this.types, key, entry);
      }
    }
  }
}

type SelectorBucket = Map<string, Array<SelectorEntry>>;

function addEntry(
  bucket: SelectorBucket,
  key: string,
  entry: SelectorEntry
): void {
  const entries = bucket.get(key);

  if (entries === undefined) {
    bucket.set(key, [entry]);
  } else {
    entries.push(entry);
  }
}

function getEntries(bucket: SelectorBucket, key: string): Array<SelectorEntry> {
  const entries = bucket.get(key);

  if (entries === undefined) {
    return [];
  }

  return entries;
}

function parseSelectors(input: string): Array<Selector> {
  const selectors: Selector | Array<Selector> | null = parseSelector(input);

  if (selectors === null) {
    return [];
  }

  return isArray(selectors) ? selectors : [selectors];
}

function parseDeclarations(input: string): Array<Declaration> {
  const declarations:
    | Declaration
    | Array<Declaration>
    | null = parseDeclaration(input);

  if (declarations === null) {
    return [];
  }

  return isArray(declarations) ? declarations : [declarations];
}
