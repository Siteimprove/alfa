import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet, Selector, SelectorGrammar } from "@siteimprove/alfa-css";
import { Node, Element, StyleSheet, StyleRule } from "./types";
import { isStyleRule, isImportRule, isGroupingRule } from "./guards";
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
  private _ids: SelectorBucket = new Map();

  private _classes: SelectorBucket = new Map();

  private _types: SelectorBucket = new Map();

  private _other: Array<SelectorEntry> = [];

  constructor(styleSheets: ArrayLike<StyleSheet>) {
    // Every rule encountered in style sheets is assigned an increasing number
    // that denotes declaration order. While rules are stored in buckets in the
    // order in which they were declared, information related to ordering will
    // otherwise no longer be available once rules from different buckets are
    // combined.
    let order: number = 0;

    for (let i = 0, n = styleSheets.length; i < n; i++) {
      traverseStyleSheet(styleSheets[i], rule => {
        if (isStyleRule(rule)) {
          const selectors = parseSelectors(rule.selectorText);

          for (const selector of selectors) {
            const keySelector = getKeySelector(selector);
            const specificity = getSpecificity(selector);

            const entry: SelectorEntry = {
              selector,
              rule,
              order: order++,
              specificity
            };

            if (keySelector === null) {
              this._other.push(entry);
            } else {
              const key = keySelector.name;

              switch (keySelector.type) {
                case "id-selector":
                  addEntry(this._ids, key, entry);
                  break;
                case "class-selector":
                  addEntry(this._classes, key, entry);
                  break;
                case "type-selector":
                  addEntry(this._types, key, entry);
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

    const collect = (entries: Array<SelectorEntry>) => {
      for (const entry of entries) {
        if (matches(element, context, entry.selector, options)) {
          rules.push(entry);
        }
      }
    };

    const id = getAttribute(element, "id");

    if (id !== null) {
      collect(getEntries(this._ids, id));
    }

    collect(getEntries(this._types, element.localName));

    for (const className of getClassList(element)) {
      collect(getEntries(this._classes, className));
    }

    collect(this._other);

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

function parseSelectors(selector: string): Array<Selector> {
  try {
    const parsed = parse(lex(selector, Alphabet), SelectorGrammar);

    if (parsed !== null) {
      return isArray(parsed) ? parsed : [parsed];
    }
  } catch (err) {}

  return [];
}
