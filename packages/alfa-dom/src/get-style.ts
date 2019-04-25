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
import { Mutable } from "@siteimprove/alfa-util";
import { getAttribute } from "./get-attribute";
import { Cascade, getCascade } from "./get-cascade";
import { getChildNodes } from "./get-child-nodes";
import { getRootNode } from "./get-root-node";
import { isDocument, isElement } from "./guards";
import { matches } from "./matches";
import { Element, Node } from "./types";

const { isArray } = Array;

export interface StyleOptions {
  readonly hover?: Element;
  readonly active?: Element;
  readonly focus?: Element;
  readonly pseudo?: PseudoElement;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#cascaded
 */
export function getCascadedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {}
): CascadedStyle {
  const style = getStyle(element, context, device, options);

  if (style === null) {
    return {};
  }

  return style.cascaded;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#specified
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {}
): SpecifiedStyle {
  const style = getStyle(element, context, device, options);

  if (style === null) {
    return {};
  }

  return style.specified;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#computed
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {}
): ComputedStyle {
  const style = getStyle(element, context, device, options);

  if (style === null) {
    return {};
  }

  return style.computed;
}

function getStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {}
): Style | null {
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

const styleTreeMaps = new WeakMap<
  Node,
  WeakMap<Node, StyleTree<Node | object>>
>();

function getStyleTree(
  node: Node,
  context: Node,
  device: Device,
  options: StyleOptions = {}
): StyleTree<Node | object> {
  const cascade = isDocument(node) ? getCascade(node, device) : null;

  let styleTreeMap = styleTreeMaps.get(context);

  if (styleTreeMap === undefined) {
    styleTreeMap = new WeakMap();
    styleTreeMaps.set(context, styleTreeMap);
  }

  let styleTree = styleTreeMap.get(node);

  if (styleTree === undefined) {
    styleTree = new StyleTree(
      getStyleEntry(node, context, cascade, device, options),
      device
    );
    styleTreeMap.set(node, styleTree);
  }

  return styleTree;
}

function getStyleEntry(
  node: Node,
  context: Node,
  cascade: Cascade | null,
  device: Device,
  options: StyleOptions = {}
): StyleEntry<Node | object> {
  const declarations: Array<Declaration> = [];
  const children: Array<StyleEntry<Node | object>> = [];

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
              declarations.push(rule.declarations[i]);
            }
          } else {
            children.push({
              target: pseudoElement,
              declarations: rule.declarations,
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
            declarations.push(important(declaration[i]));
          }
        } else {
          declarations.push(important(declaration));
        }
      }
    }
  }

  const childNodes = getChildNodes(node, context, { flattened: true });

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childNode = childNodes[i];

    if (isElement(childNode)) {
      children.push(
        getStyleEntry(childNode, context, cascade, device, options)
      );
    }
  }

  return { target: node, declarations, children };
}

const pseudoElementMaps = new WeakMap<Element, Map<PseudoElement, object>>();

function getPseudoElement(element: Element, selector: Selector): object | null {
  switch (selector.type) {
    case SelectorType.PseudoElementSelector: {
      let pseudoElementMap = pseudoElementMaps.get(element);

      if (pseudoElementMap === undefined) {
        pseudoElementMap = new Map();
        pseudoElementMaps.set(element, pseudoElementMap);
      }

      let pseudoElement = pseudoElementMap.get(selector.name);

      if (pseudoElement === undefined) {
        pseudoElement = {};
        pseudoElementMap.set(selector.name, pseudoElement);
      }

      return pseudoElement;
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
