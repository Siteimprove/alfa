import { isDocument } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { Node, Rule } from "./types";

const parentMaps: WeakMap<Node, WeakMap<Rule, Rule>> = new WeakMap();

/**
 * Given a rule and a context, get the parent of the rule within the context.
 * If the rule has no parent within the context, `null` is returned.
 *
 * @see https://www.w3.org/TR/cssom/#dom-cssrule-parentrule
 */
export function getParentRule(rule: Rule, context: Node): Rule | null {
  if (!isDocument(context)) {
    return null;
  }

  let parentMap = parentMaps.get(context);

  if (parentMap === undefined) {
    parentMap = new WeakMap();

    const { styleSheets } = context;

    for (let i = 0, n = styleSheets.length; i < n; i++) {
      traverseStyleSheet(styleSheets[i], {
        enter(rule, parentRule) {
          if (parentRule !== null) {
            parentMap!.set(rule, parentRule);
          }
        }
      });
    }

    parentMaps.set(context, parentMap);
  }

  const parent = parentMap.get(rule);

  if (parent === undefined) {
    return null;
  }

  return parent;
}
