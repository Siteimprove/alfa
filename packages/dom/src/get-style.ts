import { set, keys, each, union } from "@alfa/util";
import { Grammar, parse, lex } from "@alfa/lang";
import {
  Alphabet,
  Token,
  Color,
  ColorGrammar,
  Declaration,
  DeclarationGrammar,
  FontSize,
  FontSizeGrammar
} from "@alfa/css";
import { Node, Element } from "./types";
import { isDocument, isElement } from "./guards";
import { getAttribute } from "./get-attribute";
import { getParentNode } from "./get-parent-node";
import { Cascade, getCascade } from "./get-cascade";
import { ContextCache } from "./context-cache";

const { isArray } = Array;
const { round } = Math;

export enum Stage {
  /**
   * @see https://www.w3.org/TR/css-cascade/#cascaded
   */
  Cascaded,

  /**
   * @see https://www.w3.org/TR/css-cascade/#specified
   */
  Specified,

  /**
   * @see https://www.w3.org/TR/css-cascade/#computed
   */
  Computed
}

/**
 * @see https://www.w3.org/TR/css-cascade/#initial
 */
export type Initial = "initial";

/**
 * @see https://www.w3.org/TR/css-cascade/#inherit
 */
export type Inherit = "inherit";

export type Property<T> = T | Initial | Inherit;

export interface Style {
  /**
   * @see https://www.w3.org/TR/css-color/#the-color-property
   */
  readonly color?: Property<Color>;

  /**
   * @see https://www.w3.org/TR/css-fonts/#font-size-prop
   */
  readonly "font-size"?: Property<FontSize>;
}

export function getStyle(
  element: Element,
  context: Node,
  stage: Stage = Stage.Computed
): Style {
  switch (stage) {
    case Stage.Cascaded:
      return getCascadedStyle(element, context);
    case Stage.Specified:
      return getSpecifiedStyle(element, context);
    case Stage.Computed:
      return getComputedStyle(element, context);
  }
}

const inlineStyle: ContextCache<Node, Element, Style> = new ContextCache();

function getInlineStyle(element: Element, context: Node): Style {
  return inlineStyle.get(context, element, () => {
    const style: Style = {};

    const inline = getAttribute(element, "style");

    if (inline !== null) {
      const declarations = parseDeclarations(inline);

      for (const declaration of declarations) {
        const property = declaration.name;
        switch (property) {
          case "color":
          case "font-size":
            if (isInitial(declaration)) {
              set(style, property, "initial");
            } else if (isInherited(declaration)) {
              set(style, property, "inherit");
            } else {
              const value = getDeclaredValue(property, declaration);
              if (value !== null) {
                set(style, property, value);
              }
            }
            break;
        }
      }
    }

    return style;
  });
}

const cascadedStyle: ContextCache<Node, Element, Style> = new ContextCache();

function getCascadedStyle(element: Element, context: Node): Style {
  return cascadedStyle.get(context, element, () => {
    const style = { ...getInlineStyle(element, context) };

    const cascade = isDocument(context) ? getCascade(context) : null;

    if (cascade !== null) {
      const rules = cascade.get(element) || [];

      for (const rule of rules) {
        const declarations = parseDeclarations(rule.style.cssText);

        for (const declaration of declarations) {
          if (declaration.name in style && !declaration.important) {
            continue;
          }

          const property = declaration.name;
          switch (property) {
            case "color":
            case "font-size":
              if (isInitial(declaration)) {
                set(style, property, "initial");
              } else if (isInherited(declaration)) {
                set(style, property, "inherit");
              } else {
                const value = getDeclaredValue(property, declaration);
                if (value !== null) {
                  set(style, property, value);
                }
              }
              break;
          }
        }
      }
    }

    return style;
  });
}

const specifiedStyle: ContextCache<Node, Element, Style> = new ContextCache();

function getSpecifiedStyle(element: Element, context: Node): Style {
  return specifiedStyle.get(context, element, () => {
    const parentStyle = getParentStyle(element, context);
    const style = { ...getCascadedStyle(element, context) };

    const properties = union(keys(style), keys(parentStyle));

    each(properties, property => {
      let inherits = false;

      switch (property) {
        case "color":
        case "font-size":
          inherits = property in style === false;
      }

      switch (style[property]) {
        case "inherit":
          inherits = true;
      }

      if (inherits && property in parentStyle) {
        set(style, property, parentStyle[property]);
      }

      if (property in style === false) {
        set(style, property, getInitialValue(property));
      }
    });

    return style;
  });
}

const computedStyle: ContextCache<Node, Element, Style> = new ContextCache();

function getComputedStyle(element: Element, context: Node): Style {
  return computedStyle.get(context, element, () => {
    const parentStyle = getParentStyle(element, context);
    const style = getSpecifiedStyle(element, context);

    const properties = keys(style);

    each(properties, property => {
      set(style, property, getComputedValue(property, style, parentStyle));
    });

    return style;
  });
}

function getParentStyle(element: Element, context: Node): Style {
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

function getInitialValue<P extends keyof Style>(property: P): Style[P] {
  switch (property) {
    case "color":
      return { red: 0, green: 0, blue: 0, alpha: 1 };
    case "font-size":
      return { type: "absolute", value: "medium" };
  }
}

function getDeclaredValue<P extends keyof Style>(
  property: P,
  declaration: Declaration
): Style[P] | null {
  let grammar: Grammar<Token, Style[P]> | null = null;

  switch (property) {
    case "color":
      grammar = ColorGrammar;
      break;
    case "font-size":
      grammar = FontSizeGrammar;
  }

  if (grammar === null) {
    return null;
  }

  return parse(declaration.value, grammar);
}

function getComputedValue<P extends keyof Style>(
  property: P,
  style: Style,
  parentStyle: Style
): Style[P] {
  switch (property) {
    case "font-size":
      if (property in parentStyle === false) {
        break;
      }

      const value = style[property] as FontSize;
      const parentValue = parentStyle[property] as FontSize;

      switch (value.type) {
        case "absolute":
          let factor: number;

          switch (value.value) {
            case "xx-small":
              factor = 3 / 5;
              break;
            case "x-small":
              factor = 3 / 4;
              break;
            case "small":
              factor = 8 / 9;
              break;
            case "medium":
            default:
              factor = 1;
              break;
            case "large":
              factor = 6 / 5;
              break;
            case "x-large":
              factor = 3 / 2;
              break;
            case "xx-large":
              factor = 2;
          }

          return {
            type: "length",
            value: round(factor * 16),
            unit: "px"
          };
        case "percentage":
          if (parentValue.type !== "length") {
            break;
          }
          switch (value.unit) {
            case "em":
              return {
                type: "length",
                value: value.value * parentValue.value,
                unit: parentValue.unit
              };
          }
      }
  }

  return style[property];
}
