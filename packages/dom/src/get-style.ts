import { set, keys, each, union } from "@alfa/util";
import { parse, lex } from "@alfa/lang";
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

const { isArray } = Array;

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
  const style: Style = {};

  const inlineStyle = getAttribute(element, "style");

  if (inlineStyle !== null) {
    const declarations = parseDeclarations(inlineStyle);

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

  if (stage === Stage.Cascaded) {
    return style;
  }

  const parentNode = getParentNode(element, context);
  const parentStyle =
    parentNode !== null && isElement(parentNode)
      ? getStyle(parentNode, context, Stage.Computed)
      : null;

  const properties =
    parentStyle === null ? keys(style) : union(keys(style), keys(parentStyle));

  each(properties, property => {
    let inherits = false;

    switch (property) {
      case "color":
      case "font-size":
        inherits = !(property in style);
    }

    switch (style[property]) {
      case "inherit":
        inherits = true;
    }

    if (inherits && parentStyle !== null && property in parentStyle) {
      set(style, property, parentStyle[property]);
    }

    if (property in style === false) {
      set(style, property, getInitialValue(property));
    }
  });

  if (stage === Stage.Specified) {
    return style;
  }

  each(properties, property => {
    set(
      style,
      property,
      getComputedValue(property, style, parentStyle ? parentStyle : null)
    );
  });

  return style;
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
  switch (property) {
    case "color":
      const color = parse(declaration.value, ColorGrammar);
      if (color !== null) {
        return color;
      }
      break;
    case "font-size":
      const fontSize = parse(declaration.value, FontSizeGrammar);
      if (fontSize !== null) {
        return fontSize;
      }
  }

  return null;
}

function getComputedValue<P extends keyof Style>(
  property: P,
  style: Style,
  parentStyle: Style | null
): Style[P] {
  switch (property) {
    case "font-size":
      const value = style[property] as FontSize;
      const parentValue = parentStyle
        ? (parentStyle[property] as FontSize)
        : null;
      if (parentValue === null) {
        break;
      }
      switch (value.type) {
        case "absolute":
          switch (value.value) {
          }
          break;
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
