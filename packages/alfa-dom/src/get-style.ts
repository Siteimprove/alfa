import {
  CascadedStyle,
  ComputedStyle,
  Declaration,
  parseDeclaration,
  PseudoElement,
  resolveCascadedStyle,
  resolveComputedStyle,
  resolveSpecifiedStyle,
  Selector,
  SelectorType,
  SpecifiedStyle
} from "@siteimprove/alfa-css";
import {Device} from "@siteimprove/alfa-device";
import { getAttribute } from "./get-attribute";
import { getCascade } from "./get-cascade";
import { getParentElement } from "./get-parent-element";
import { getRootNode } from "./get-root-node";
import { isDocument } from "./guards";
import { matches } from "./matches";
import { Element, Node } from "./types";

const { isArray } = Array;

export type StyleOptions = Readonly<{
  hover?: Element;
  active?: Element;
  focus?: Element;
  pseudo?: PseudoElement;
}>;

/**
 * @see https://www.w3.org/TR/css-cascade/#cascaded
 */
export function getCascadedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {}
): CascadedStyle {
  const declarations: Array<Declaration> = [];

  const style = getAttribute(element, "style");

  if (style !== null && options.pseudo === undefined) {
    const declaration = parseDeclaration(style);

    if (declaration !== null) {
      if (isArray(declaration)) {
        declarations.push(...declaration);
      } else {
        declarations.push(declaration);
      }
    }
  }

  const rootNode = getRootNode(element, context);
  const cascade = isDocument(rootNode) ? getCascade(rootNode, device) : null;

  if (cascade !== null) {
    for (
      let entry = cascade.get(element);
      entry !== null;
      entry = entry.parent
    ) {
      const { selector } = entry;
      const pseudo = getPseudoElement(selector);

      if (pseudo === null) {
        if (options.pseudo !== undefined) {
          continue;
        }
      } else {
        if (options.pseudo !== pseudo) {
          continue;
        }
      }

      const { hover, active, focus } = options;

      if (
        matches(element, context, selector, {
          hover,
          active,
          focus,
          pseudo: true
        })
      ) {
        declarations.push(...entry.declarations);
      }
    }
  }

  return resolveCascadedStyle(declarations);
}

/**
 * @see https://www.w3.org/TR/css-cascade/#specified
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  device: Device,
  options?: StyleOptions
): SpecifiedStyle;

/**
 * @internal
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  device: Device,
  options?: StyleOptions,
  parentStyle?: ComputedStyle
): SpecifiedStyle;

export function getSpecifiedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {},
  parentStyle: ComputedStyle = getParentStyle(element, context, device, options)
): SpecifiedStyle {
  const cascadedStyle = getCascadedStyle(element, context, device, options);

  return resolveSpecifiedStyle(cascadedStyle, parentStyle);
}

/**
 * @see https://www.w3.org/TR/css-cascade/#computed
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  device: Device,
  options?: StyleOptions
): ComputedStyle;

/**
 * @internal
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  device: Device,
  options?: StyleOptions,
  parentStyle?: ComputedStyle
): ComputedStyle;

export function getComputedStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions = {},
  parentStyle: ComputedStyle = getParentStyle(element, context, device, options)
): ComputedStyle {
  const specifiedStyle = getSpecifiedStyle(
    element,
    context,
    device,
    options,
    parentStyle
  );

  return resolveComputedStyle(specifiedStyle, parentStyle);
}

function getParentStyle(
  element: Element,
  context: Node,
  device: Device,
  options: StyleOptions
): ComputedStyle {
  const parentElement = getParentElement(element, context, { flattened: true });

  if (parentElement === null) {
    return {};
  }

  const { pseudo } = options;

  options = { ...options, pseudo: undefined };

  let parentStyle = getComputedStyle(
    parentElement,
    context,
    device,
    options,
    getParentStyle(parentElement, context, device, options)
  );

  // If we're getting the style of a pseudo-element, the parent style will be
  // that of the origin element.
  if (pseudo !== undefined) {
    parentStyle = getComputedStyle(element, context, device, options, parentStyle);
  }

  return parentStyle;
}

function getPseudoElement(selector: Selector): PseudoElement | null {
  switch (selector.type) {
    case SelectorType.PseudoElementSelector:
      return selector.name;

    case SelectorType.CompoundSelector:
    case SelectorType.RelativeSelector:
      return getPseudoElement(selector.right);
  }

  return null;
}
