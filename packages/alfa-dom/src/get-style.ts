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
import { Cache, Mutable, Option } from "@siteimprove/alfa-util";
import { getAttribute } from "./get-attribute";
import { Cascade, getCascade } from "./get-cascade";
import { getChildNodes } from "./get-child-nodes";
import { getRootNode } from "./get-root-node";
import { isDocument, isElement } from "./guards";
import { matches } from "./matches";
import { Element, Node, Rule } from "./types";

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
  const style = getStyle(element, context, device, options);

  if (style === null) {
    return {};
  }

  return style.cascaded;
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
  const style = getStyle(element, context, device, options);

  if (style === null) {
    return {};
  }

  return style.specified;
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
  const style = getStyle(element, context, device, options);

  if (style === null) {
    return {};
  }

  return style.computed;
}

export namespace getComputedStyle {
  export type Options = getStyle.Options;
}

function getStyle(
  element: Element,
  context: Node,
  device: Device,
  options: getStyle.Options = {}
): Style<Rule> | null {
  const styleTree = getStyleTree(
    getRootNode(element, context),
    context,
    device,
    options
  );

  if (options.pseudo !== undefined) {
    const pseudoElementMap = pseudoElementMaps.get(element);

    if (pseudoElementMap !== undefined) {
      const pseudoElement = pseudoElementMap.get(options.pseudo);

      if (pseudoElement !== undefined) {
        return styleTree.get(pseudoElement);
      }
    }

    return null;
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

const styleTrees = Cache.of<
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
    .get(context, Cache.of)
    .get(device, Cache.of)
    .get(node, () => {
      const cascade = isDocument(node) ? getCascade(node, device) : null;

      return new StyleTree(
        getStyleEntry(node, context, cascade, device, options),
        device
      );
    });
}

function getStyleEntry(
  node: Node,
  context: Node,
  cascade: Cascade | null,
  device: Device,
  options: getStyle.Options = {}
): StyleEntry<Node | object, Rule> {
  const declarations: Array<[Declaration, Option<Rule>]> = [];

  const children: Array<StyleEntry<Node | object, Rule>> = [];

  if (isElement(node)) {
    if (cascade !== null) {
      for (let rule = cascade.get(node); rule !== null; rule = rule.parent) {
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
              declarations.push([rule.declarations[i], rule.rule]);
            }
          } else {
            const declarations: Array<[Declaration, Option<Rule>]> = [];

            for (const declaration of rule.declarations) {
              declarations.push([declaration, rule.rule]);
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

    const style = getAttribute(node, "style");

    if (style !== null) {
      const declaration = parseDeclaration(style);

      if (declaration !== null) {
        if (isArray(declaration)) {
          for (let i = 0, n = declaration.length; i < n; i++) {
            declarations.push([important(declaration[i]), null]);
          }
        } else {
          declarations.push([important(declaration), null]);
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

const pseudoElements = Cache.of<
  Element,
  Cache<PseudoElement, { readonly pseudoElement: PseudoElement }>
>();

function getPseudoElement(element: Element, selector: Selector): object | null {
  switch (selector.type) {
    case SelectorType.PseudoElementSelector: {
      return pseudoElements.get(element, Cache.of).get(selector.name, () => {
        return { pseudoElement: selector.name };
      });
    }

    case SelectorType.CompoundSelector:
    case SelectorType.RelativeSelector:
      return getPseudoElement(element, selector.right);
  }

  return null;
}

function important(declaration: Mutable<Declaration>): Declaration {
  declaration.important = true;
  return declaration;
}
