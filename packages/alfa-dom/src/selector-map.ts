import {
  Selector,
  Declaration,
  parseSelector,
  parseDeclaration
} from "@siteimprove/alfa-css";
import { Node, Element, StyleSheet } from "./types";
import { isStyleRule } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { matches, MatchingOptions } from "./matches";
import { getAttribute } from "./get-attribute";
import { getClassList } from "./get-class-list";
import { getKeySelector } from "./get-key-selector";
import { getSpecificity } from "./get-specificity";

const { isArray } = Array;

/**
 * @internal
 */
export type SelectorEntry = {
  readonly selector: Selector;
  readonly declarations: Array<Declaration>;
  readonly order: number;
  readonly specificity: number;
};

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
  private ids: SelectorBucket = new Map();

  private classes: SelectorBucket = new Map();

  private types: SelectorBucket = new Map();

  private other: Array<SelectorEntry> = [];

  constructor(styleSheets: ArrayLike<StyleSheet>) {
    const { other, ids, classes, types } = this;

    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order: number = 0;

    for (let i = 0, n = styleSheets.length; i < n; i++) {
      traverseStyleSheet(styleSheets[i], {
        enter(rule) {
          if (!isStyleRule(rule)) {
            return;
          }

          let selectors: Selector | Array<Selector> | null = parseSelector(
            rule.selectorText
          );

          if (selectors === null) {
            return;
          }

          selectors = isArray(selectors) ? selectors : [selectors];

          let declarations:
            | Declaration
            | Array<Declaration>
            | null = parseDeclaration(rule.style.cssText);

          if (declarations === null) {
            return;
          }

          declarations = isArray(declarations) ? declarations : [declarations];

          order++;

          for (let i = 0, n = selectors.length; i < n; i++) {
            const selector = selectors[i];

            const keySelector = getKeySelector(selector);
            const specificity = getSpecificity(selector);

            const entry: SelectorEntry = {
              selector,
              order,
              specificity,
              declarations
            };

            if (keySelector === null) {
              other.push(entry);
            } else {
              const key = keySelector.name;

              switch (keySelector.type) {
                case "id-selector":
                  addEntry(ids, key, entry);
                  break;
                case "class-selector":
                  addEntry(classes, key, entry);
                  break;
                case "type-selector":
                  addEntry(types, key, entry);
              }
            }
          }
        }
      });
    }
  }

  public getRules(
    element: Element,
    context: Node,
    options?: MatchingOptions
  ): Array<SelectorEntry> {
    const rules: Array<SelectorEntry> = [];

    const id = getAttribute(element, "id");

    if (id !== null) {
      collectEntries(
        element,
        context,
        rules,
        getEntries(this.ids, id),
        options
      );
    }

    collectEntries(
      element,
      context,
      rules,
      getEntries(this.types, element.localName),
      options
    );

    for (const className of getClassList(element)) {
      collectEntries(
        element,
        context,
        rules,
        getEntries(this.classes, className),
        options
      );
    }

    collectEntries(element, context, rules, this.other, options);

    return rules;
  }
}

type SelectorBucket = Map<string, Array<SelectorEntry>>;

function addEntry(
  bucket: SelectorBucket,
  key: string,
  entry: SelectorEntry
): void {
  let entries = bucket.get(key);

  if (entries === undefined) {
    entries = [];
    bucket.set(key, entries);
  }

  entries.push(entry);
}

function getEntries(bucket: SelectorBucket, key: string): Array<SelectorEntry> {
  let entries = bucket.get(key);

  if (entries === undefined) {
    return [];
  }

  return entries;
}

function collectEntries(
  element: Element,
  context: Node,
  target: Array<SelectorEntry>,
  entries: Array<SelectorEntry>,
  options?: MatchingOptions
) {
  for (let i = 0, n = entries.length; i < n; i++) {
    const entry = entries[i];

    if (matches(element, context, entry.selector, options)) {
      target.push(entry);
    }
  }
}
