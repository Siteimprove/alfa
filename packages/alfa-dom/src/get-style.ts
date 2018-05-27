import { Mutable, keys, union, last } from "@siteimprove/alfa-util";
import { Grammar, parse, lex } from "@siteimprove/alfa-lang";
import {
  Alphabet,
  Token,
  Selector,
  Declaration,
  DeclarationGrammar,
  Stage,
  Style,
  Properties,
  PropertyName,
  PseudoElement
} from "@siteimprove/alfa-css";
import { Node, Element } from "./types";
import { isDocument, isElement } from "./guards";
import { matches } from "./matches";
import { getAttribute } from "./get-attribute";
import { getParentNode } from "./get-parent-node";
import { Cascade, getCascade } from "./get-cascade";

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
  options?: StyleOptions,
  cascade?: Cascade | null
): Style<Stage.Cascaded>;

export function getCascadedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  cascade: Cascade | null = getCascade(context)
): Style<Stage.Cascaded> {
  const cascadedStyle: Mutable<Style<Stage.Cascaded>> = {};

  const style = getAttribute(element, "style");

  const declarations: Array<Declaration> = [];

  if (style !== null && options.pseudo === undefined) {
    declarations.push(...parseDeclarations(style));
  }

  if (cascade !== null) {
    const entries = cascade.get(element);

    if (entries !== undefined) {
      for (const { selector, rule } of entries) {
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
          declarations.push(...parseDeclarations(rule.style.cssText));
        }
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
    // the cascaded styles can override those set inline to we move on if the
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
  cascade?: Cascade | null,
  parentStyle?: Style<Stage.Computed>
): Style<Stage.Specified>;

export function getSpecifiedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  cascade: Cascade | null = getCascade(context),
  parentStyle: Style<Stage.Computed> = getParentStyle(
    element,
    context,
    options,
    cascade
  )
): Style<Stage.Specified> {
  const specifiedStyle: Mutable<Style<Stage.Specified>> = {};

  const cascadedStyle = getCascadedStyle(element, context, options, cascade);

  const propertyNames = union(keys(cascadedStyle), keys(parentStyle));

  for (const propertyName of propertyNames) {
    const property = Properties[propertyName];
    const value = cascadedStyle[propertyName];
    const inherited = parentStyle[propertyName];

    const shouldInherit =
      value === "inherit" || (value === undefined && property.inherits);

    if (shouldInherit && inherited !== undefined) {
      specifiedStyle[propertyName] = inherited;
    } else if (value === undefined || value === "initial") {
      specifiedStyle[propertyName] = property.initial;
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
  cascade?: Cascade | null,
  parentStyle?: Style<Stage.Computed>
): Style<Stage.Computed>;

export function getComputedStyle(
  element: Element,
  context: Node,
  options: StyleOptions = {},
  cascade: Cascade | null = getCascade(context),
  parentStyle: Style<Stage.Computed> = getParentStyle(
    element,
    context,
    options,
    cascade
  )
): Style<Stage.Computed> {
  const computedStyle: Mutable<Style<Stage.Computed>> = {};

  const specifiedStyle = getSpecifiedStyle(
    element,
    context,
    options,
    cascade,
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
  options: StyleOptions,
  cascade: Cascade | null
): Style<Stage.Computed> {
  const parentNode = getParentNode(element, context);

  if (parentNode === null || !isElement(parentNode)) {
    return {};
  }

  const { pseudo } = options;

  options = { ...options, pseudo: undefined };

  let parentStyle = getComputedStyle(
    parentNode,
    context,
    options,
    cascade,
    getParentStyle(parentNode, context, options, cascade)
  );

  // If we're getting the style of a pseudo-element, the parent style will be
  // that of the origin element.
  if (pseudo !== undefined) {
    parentStyle = getComputedStyle(
      element,
      context,
      options,
      cascade,
      parentStyle
    );
  }

  return parentStyle;
}

function getPseudoElement(selector: Selector): PseudoElement | null {
  if (selector.type === "relative-selector") {
    return getPseudoElement(selector.selector);
  }

  if (selector.type === "compound-selector") {
    return getPseudoElement(last(selector.selectors)!);
  }

  if (selector.type === "pseudo-element-selector") {
    return selector.name;
  }

  return null;
}

function parseDeclarations(input: string): Array<Declaration> {
  const declarations = parse(lex(input, Alphabet), DeclarationGrammar);
  return declarations === null
    ? []
    : isArray(declarations)
      ? declarations
      : [declarations];
}

function isInitial(declaration: Declaration): boolean {
  const value = declaration.value.filter(token => token.type !== "whitespace");

  if (value.length !== 1) {
    return false;
  }

  const [token] = value;

  return token.type === "ident" && token.value === "initial";
}

function isInherited(declaration: Declaration): boolean {
  const value = declaration.value.filter(token => token.type !== "whitespace");

  if (value.length !== 1) {
    return false;
  }

  const [token] = value;

  return token.type === "ident" && token.value === "inherit";
}
