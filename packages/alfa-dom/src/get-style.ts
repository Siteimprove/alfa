import {
  Declaration,
  parseDeclaration,
  Properties,
  PropertyName,
  PseudoElement,
  Selector,
  SelectorType,
  Stage,
  Style,
  TokenType
} from "@siteimprove/alfa-css";
import { keys, Mutable, union } from "@siteimprove/alfa-util";
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

export function getCascadedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions
): Style<Stage.Cascaded>;

/**
 * @internal
 */
export function getCascadedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions
): Style<Stage.Cascaded>;

export function getCascadedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {}
): Style<Stage.Cascaded> {
  const cascadedStyle: Mutable<Style<Stage.Cascaded>> = {};

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

  for (const declaration of declarations) {
    const propertyName = getPropertyName(declaration.name);

    if (propertyName === null) {
      continue;
    }

    // If the property name is already present in the cascaded style then this
    // means that the property was set inline and that we're now trying to set
    // it from the cascaded styles. However, only important declarations from
    // the cascaded styles can override those set inline so we move on if the
    // declaration is not important.
    if (propertyName in cascadedStyle && !declaration.important) {
      continue;
    }

    if (isInitial(declaration)) {
      cascadedStyle[propertyName] = "initial";
    } else if (isInherited(declaration)) {
      cascadedStyle[propertyName] = "inherit";
    } else {
      const property = Properties[propertyName];
      const value = property.parse(declaration.value);
      if (value !== null) {
        cascadedStyle[propertyName] = value;
      }
    }
  }

  return cascadedStyle;
}

export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions
): Style<Stage.Specified>;

/**
 * @internal
 */
export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions,
  parentStyle?: Style<Stage.Computed>
): Style<Stage.Specified>;

export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  parentStyle: Style<Stage.Computed> = getParentStyle(element, context, options)
): Style<Stage.Specified> {
  const specifiedStyle: Mutable<Style<Stage.Specified>> = {};

  const cascadedStyle = getCascadedStyle(element, context, options);

  const propertyNames = union(keys(cascadedStyle), keys(parentStyle));

  for (const propertyName of propertyNames) {
    const property = Properties[propertyName];
    const value = cascadedStyle[propertyName];
    const inherited = parentStyle[propertyName];

    const shouldInherit =
      value === "inherit" ||
      (value === undefined && property.inherits === true);

    if (shouldInherit && inherited !== undefined) {
      specifiedStyle[propertyName] = inherited;
    } else if (value === undefined || value === "initial") {
      specifiedStyle[propertyName] = property.initial(
        specifiedStyle,
        parentStyle
      );
    } else if (value !== "inherit") {
      specifiedStyle[propertyName] = value;
    }
  }

  return specifiedStyle;
}

export function getComputedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions
): Style<Stage.Computed>;

/**
 * @internal
 */
export function getComputedStyle(
  element: Element,
  context: Node,
  options?: StyleOptions,
  parentStyle?: Style<Stage.Computed>
): Style<Stage.Computed>;

export function getComputedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  parentStyle: Style<Stage.Computed> = getParentStyle(element, context, options)
): Style<Stage.Computed> {
  const computedStyle: Mutable<Style<Stage.Computed>> = {};

  const specifiedStyle = getSpecifiedStyle(
    element,
    context,
    options,
    parentStyle
  );

  const propertyNames = keys(specifiedStyle);

  for (const propertyName of propertyNames) {
    const property = Properties[propertyName];
    const computed = property.computed(specifiedStyle, parentStyle);

    if (computed !== null) {
      computedStyle[propertyName] = computed;
    }
  }

  return computedStyle;
}

function getPropertyName(input: string): PropertyName | null {
  const propertyName = input.replace(/-([a-z])/g, match =>
    match[1].toUpperCase()
  );

  if (propertyName in Properties) {
    return propertyName as PropertyName;
  }

  return null;
}

function getParentStyle(
  element: Element,
  context: Node,
  options: StyleOptions
): Style<Stage.Computed> {
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

function isInitial(declaration: Declaration): boolean {
  const value = declaration.value.filter(
    token => token.type !== TokenType.Whitespace
  );

  if (value.length !== 1) {
    return false;
  }

  const [token] = value;

  return token.type === TokenType.Ident && token.value === "initial";
}

function isInherited(declaration: Declaration): boolean {
  const value = declaration.value.filter(
    token => token.type !== TokenType.Whitespace
  );

  if (value.length !== 1) {
    return false;
  }

  const [token] = value;

  return token.type === TokenType.Ident && token.value === "inherit";
}
