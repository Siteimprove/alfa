import { Selector, parseSelector } from "@siteimprove/alfa-css";
import { Node, Element, StyleSheet, StyleRule } from "./types";
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
  readonly rule: StyleRule;
  readonly order: number;
  readonly specificity: number;
};

/**
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

          let selectors: Selector | Array<Selector> | null = null;
          try {
            selectors = parseSelector(rule.selectorText);
          } catch (err) {}

          if (selectors === null) {
            return;
          }

          for (const selector of isArray(selectors) ? selectors : [selectors]) {
            const keySelector = getKeySelector(selector);
            const specificity = getSpecificity(selector);

            const entry: SelectorEntry = {
              selector,
              rule,
              order: order++,
              specificity
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
