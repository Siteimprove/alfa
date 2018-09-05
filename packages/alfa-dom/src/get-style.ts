import {
  CascadedStyle,
  ComputedStyle,
  Declaration,
  getCascadedPropertyValue,
  getComputedPropertyValue,
  getPropertyName,
  getSpecifiedPropertyValue,
  parseDeclaration,
  PropertyName,
  PseudoElement,
  Selector,
  SelectorType,
  SpecifiedStyle
} from "@siteimprove/alfa-css";
import { keys, Mutable } from "@siteimprove/alfa-util";
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
  options: StyleOptions = {}
): CascadedStyle {
  const cascadedStyle: Mutable<CascadedStyle> = {};

  const style = getAttribute(element, "style");
  const rootNode = getRootNode(element, context);
  const cascade = isDocument(rootNode) ? getCascade(rootNode) : null;

  const declarations: Array<Declaration> = [];

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

  for (const { name, value, important } of declarations) {
    const propertyName = getPropertyName(name);

    if (propertyName === null) {
      continue;
    }

    // If the property name is already present in the cascaded style then this
    // means that the property was set inline and that we're now trying to set
    // it from the cascaded styles. However, only important declarations from
    // the cascaded styles can override those set inline so we move on if the
    // declaration is not important.
    if (propertyName in cascadedStyle && !important) {
      continue;
    }

    const propertyValue = getCascadedPropertyValue(propertyName, value);

    if (propertyValue !== undefined) {
      cascadedStyle[propertyName] = propertyValue;
    }
  }

  return cascadedStyle;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#specified
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions
): SpecifiedStyle;

/**
 * @internal
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions,
  parentStyle?: ComputedStyle
): SpecifiedStyle;

export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  parentStyle: ComputedStyle = getParentStyle(element, context, options)
): SpecifiedStyle {
  const specifiedStyle: Mutable<SpecifiedStyle> = {};

  const cascadedStyle = getCascadedStyle(element, context, options);

  const propertyNames = new Set<PropertyName>();

  for (const propertyName of keys(cascadedStyle)) {
    propertyNames.add(propertyName);
  }

  for (const propertyName of keys(parentStyle)) {
    propertyNames.add(propertyName);
  }

  for (const propertyName of propertyNames) {
    const propertyValue = getSpecifiedPropertyValue(
      propertyName,
      cascadedStyle,
      specifiedStyle,
      parentStyle
    );

    if (propertyValue !== undefined) {
      specifiedStyle[propertyName] = propertyValue;
    }
  }

  return specifiedStyle;
}

/**
 * @see https://www.w3.org/TR/css-cascade/#computed
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions
): ComputedStyle;

/**
 * @internal
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions,
  parentStyle?: ComputedStyle
): ComputedStyle;

export function getComputedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  parentStyle: ComputedStyle = getParentStyle(element, context, options)
): ComputedStyle {
  const computedStyle: Mutable<ComputedStyle> = {};

  const specifiedStyle = getSpecifiedStyle(
    element,
    context,
    options,
    parentStyle
  );

  const propertyNames = keys(specifiedStyle);

  for (const propertyName of propertyNames) {
    const propertyValue = getComputedPropertyValue(
      propertyName,
      specifiedStyle,
      computedStyle,
      parentStyle
    );

    if (propertyValue !== undefined) {
      computedStyle[propertyName] = propertyValue;
    }
  }

  return computedStyle;
}

function getParentStyle(
  element: Element,
  context: Node,
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
    options,
    getParentStyle(parentElement, context, options)
  );

  // If we're getting the style of a pseudo-element, the parent style will be
  // that of the origin element.
  if (pseudo !== undefined) {
    parentStyle = getComputedStyle(element, context, options, parentStyle);
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
