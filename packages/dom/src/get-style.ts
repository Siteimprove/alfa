import { set, keys, each, union } from "@alfa/util";
import { Grammar, parse, lex } from "@alfa/lang";
import {
  Alphabet,
  Token,
  Declaration,
  DeclarationGrammar,
  Stage,
  Style,
  Properties,
  PropertyName
} from "@alfa/css";
import { Node, Element } from "./types";
import { isDocument, isElement } from "./guards";
import { getAttribute } from "./get-attribute";
import { getParentNode } from "./get-parent-node";
import { Cascade, getCascade } from "./get-cascade";
import { ContextCache } from "./context-cache";

const { isArray } = Array;

export function getStyle<S extends Stage = Stage.Computed>(
  element: Element,
  context: Node,
  stage?: S
): Style<S> {
  switch (stage) {
    case Stage.Cascaded:
      return getCascadedStyle(element, context) as Style<S>;
    case Stage.Specified:
      return getSpecifiedStyle(element, context) as Style<S>;
    case Stage.Computed:
    default:
      return getComputedStyle(element, context) as Style<S>;
  }
}

function getPropertyName(input: string): PropertyName | null {
  switch (input) {
    case "color":
      return input;
    case "font-size":
      return "fontSize";
  }

  return null;
}

const cascadedStyle: ContextCache<
  Node,
  Element,
  Style<Stage.Cascaded>
> = new ContextCache();

function getCascadedStyle(
  element: Element,
  context: Node
): Style<Stage.Cascaded> {
  return cascadedStyle.get(context, element, () => {
    const cascadedStyle: Style<Stage.Cascaded> = {};

    const style = getAttribute(element, "style");
    const cascade = isDocument(context) ? getCascade(context) : null;

    const declarations: Array<Declaration> = [];

    if (style !== null) {
      declarations.push(...parseDeclarations(style));
    }

    if (cascade !== null) {
      const rules = cascade.get(element) || [];

      for (const rule of rules) {
        declarations.push(...parseDeclarations(rule.style.cssText));
      }
    }

    for (const declaration of declarations) {
      const propertyName = getPropertyName(declaration.name);

      if (propertyName === null) {
        continue;
      }

      if (propertyName in cascadedStyle && !declaration.important) {
        continue;
      }

      if (isInitial(declaration)) {
        set(cascadedStyle, propertyName, "initial");
      } else if (isInherited(declaration)) {
        set(cascadedStyle, propertyName, "inherit");
      } else {
        const property = Properties[propertyName];
        const value = parse(declaration.value, property.grammar as Grammar<
          Token,
          any
        >);
        if (value !== null) {
          set(cascadedStyle, propertyName, value);
        }
      }
    }

    return cascadedStyle;
  });
}

const specifiedStyle: ContextCache<
  Node,
  Element,
  Style<Stage.Specified>
> = new ContextCache();

function getSpecifiedStyle(
  element: Element,
  context: Node
): Style<Stage.Specified> {
  return specifiedStyle.get(context, element, () => {
    const specifiedStyle: Style<Stage.Specified> = {};

    const parentStyle = getParentStyle(element, context);
    const cascadedStyle = getCascadedStyle(element, context);

    const propertyNames = union(keys(cascadedStyle), keys(parentStyle));

    each(propertyNames, propertyName => {
      const property = Properties[propertyName];

      if (property.inherits) {
        const inherited = parentStyle[propertyName];

        if (inherited !== undefined) {
          const value = cascadedStyle[propertyName];

          if (value === undefined || value === "inherit") {
            set(specifiedStyle, propertyName, inherited);
          }
        }
      }

      if (propertyName in specifiedStyle) {
        return;
      }

      const value = cascadedStyle[propertyName];

      if (value === undefined || value === "initial") {
        const initial = property.initial();

        if (initial !== null) {
          set(specifiedStyle, propertyName, initial);
        }
      } else if (value !== "inherit") {
        set(specifiedStyle, propertyName, value);
      }
    });

    return specifiedStyle;
  });
}

const computedStyle: ContextCache<
  Node,
  Element,
  Style<Stage.Computed>
> = new ContextCache();

function getComputedStyle(
  element: Element,
  context: Node
): Style<Stage.Computed> {
  return computedStyle.get(context, element, () => {
    const computedStyle: Style<Stage.Computed> = {};

    const parentStyle = getParentStyle(element, context);
    const specifiedStyle = getSpecifiedStyle(element, context);

    const propertyNames = keys(specifiedStyle);

    each(propertyNames, propertyName => {
      const property = Properties[propertyName];
      const computed = property.computed(specifiedStyle, parentStyle);

      if (computed !== null) {
        set(computedStyle, propertyName, computed);
      }
    });

    return computedStyle;
  });
}

function getParentStyle(
  element: Element,
  context: Node
): Style<Stage.Computed> {
  const parentNode = getParentNode(element, context);

  if (parentNode === null || !isElement(parentNode)) {
    return {};
  }

  return computedStyle.get(context, parentNode, () =>
    getComputedStyle(parentNode, context)
  );
}

function parseDeclarations(input: string): Array<Declaration> {
  const declarations = parse(lex(input, Alphabet), DeclarationGrammar);

  if (declarations === null) {
    return [];
  }

  return isArray(declarations) ? declarations : [declarations];
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
