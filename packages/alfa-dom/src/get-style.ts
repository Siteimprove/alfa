import { Cache } from "@siteimprove/alfa-cache";
import {
  CascadedStyle,
  ComputedStyle,
  Declaration,
  parseDeclaration,
  PseudoElement,
  Selector,
  SelectorType,
  SpecifiedStyle,
  Style,
  StyleEntry,
  StyleTree
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option, Some } from "@siteimprove/alfa-option";

import { getAttribute } from "./get-attribute";
import { Cascade, getCascade } from "./get-cascade";
import { getChildNodes } from "./get-child-nodes";
import { getRootNode } from "./get-root-node";
import { isDocument, isElement, isShadowRoot } from "./guards";
import { matches } from "./matches";
import { Element, Node, Rule } from "./types";

const { assign } = Object;
const { isArray } = Array;

/**
 * @see https://www.w3.org/TR/css-cascade/#cascaded
 */
export function getCascadedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: getCascadedStyle.Options = {}
): CascadedStyle<Rule> {
  return getStyle(element, context, device, options)
    .map(style => style.cascaded)
    .getOr({});
}

export namespace getCascadedStyle {
  export type Options = getStyle.Options;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#specified
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: getSpecifiedStyle.Options = {}
): SpecifiedStyle<Rule> {
  return getStyle(element, context, device, options)
    .map(style => style.specified)
    .getOr({});
}

export namespace getSpecifiedStyle {
  export type Options = getStyle.Options;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#computed
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: getComputedStyle.Options = {}
): ComputedStyle<Rule> {
  return getStyle(element, context, device, options)
    .map(style => style.computed)
    .getOr({});
}

export namespace getComputedStyle {
  export type Options = getStyle.Options;
}

function getStyle(
  element: Element,
  context: Node,
  device: Device,
  options: getStyle.Options = {}
): Option<Style<Rule>> {
  const styleTree = getStyleTree(
    getRootNode(element, context),
    context,
    device,
    options
  );

  const { pseudo } = options;

  if (pseudo !== undefined) {
    const pseudoElement = pseudoElements.get(element, Cache.empty).get(pseudo);

    return pseudoElement.flatMap(pseudoElement => styleTree.get(pseudoElement));
  }

  return styleTree.get(element);
}

namespace getStyle {
  export interface Options {
    readonly hover?: Element;
    readonly active?: Element;
    readonly focus?: Element;
    readonly pseudo?: PseudoElement;
  }
}

const styleTrees = Cache.empty<
  Node,
  Cache<Device, Cache<Node, StyleTree<Node | object, Rule>>>
>();

function getStyleTree(
  node: Node,
  context: Node,
  device: Device,
  options: getStyle.Options = {}
): StyleTree<Node | object, Rule> {
  return styleTrees
    .get(context, Cache.empty)
    .get(device, Cache.empty)
    .get(node, () => {
      const cascade =
        isDocument(node) || isShadowRoot(node)
          ? Some.of(getCascade(node, device))
          : None;

      return new StyleTree(
        getStyleEntry(node, context, cascade, device, options),
        device
      );
    });
}

function getStyleEntry(
  node: Node,
  context: Node,
  cascade: Option<Cascade>,
  device: Device,
  options: getStyle.Options = {}
): StyleEntry<Node | object, Rule> {
  const declarations: Array<[Declaration, Option<Rule>]> = [];

  const children: Array<StyleEntry<Node | object, Rule>> = [];

  if (isElement(node)) {
    if (cascade.isSome()) {
      for (
        let rule = cascade
          .get()
          .get(node)
          .getOr(null);
        rule !== null;
        rule = rule.parent
      ) {
        const { selector } = rule;
        const { hover, active, focus } = options;

        if (
          matches(node, context, selector, {
            hover,
            active,
            focus,
            pseudo: true
          })
        ) {
          const pseudoElement = getPseudoElement(node, selector);

          if (pseudoElement === null) {
            for (let i = 0, n = rule.declarations.length; i < n; i++) {
              declarations.push([rule.declarations[i], Some.of(rule.rule)]);
            }
          } else {
            const declarations: Array<[Declaration, Option<Rule>]> = [];

            for (const declaration of rule.declarations) {
              declarations.push([declaration, Some.of(rule.rule)]);
            }

            children.push({
              target: pseudoElement,
              declarations,
              children: []
            });
          }
        }
      }
    }

    const style = getAttribute(node, context, "style");

    if (style.isSome()) {
      const declaration = parseDeclaration(style.get());

      if (declaration !== null) {
        if (isArray(declaration)) {
          for (let i = 0, n = declaration.length; i < n; i++) {
            declarations.push([important(declaration[i]), None]);
          }
        } else {
          declarations.push([important(declaration), None]);
        }
      }
    }
  }

  const childNodes = getChildNodes(node, context, { flattened: true });

  for (const childNode of childNodes) {
    if (isElement(childNode)) {
      children.push(
        getStyleEntry(childNode, context, cascade, device, options)
      );
    }
  }

  return { target: node, declarations, children };
}

const pseudoElements = Cache.empty<
  Element,
  Cache<PseudoElement, { readonly pseudoElement: PseudoElement }>
>();

function getPseudoElement(element: Element, selector: Selector): object | null {
  switch (selector.type) {
    case SelectorType.PseudoElementSelector: {
      return pseudoElements.get(element, Cache.empty).get(selector.name, () => {
        return { pseudoElement: selector.name };
      });
    }

    case SelectorType.CompoundSelector:
    case SelectorType.RelativeSelector:
      return getPseudoElement(element, selector.right);
  }

  return null;
}

function important(declaration: Declaration): Declaration {
  return assign(declaration, { important: true });
}
