import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import {
  Attribute,
  Block,
  Declaration,
  Document,
  Element,
  FontFaceRule,
  Fragment,
  KeyframeRule,
  KeyframesRule,
  MediaRule,
  Namespace,
  NamespaceRule,
  Node,
  PageRule,
  Rule,
  Shadow,
  Sheet,
  StyleRule,
  SupportsRule,
  Text,
  Type,
} from ".";

const { entries } = Object;
const { nor } = Predicate;

/**
 * @public
 */
export function h<N extends string = string>(
  name: N,
  attributes?: Array<Attribute> | Record<string, string | boolean>,
  children?: Array<Node | string>,
  style?: Array<Declaration> | Record<string, string>
): Element<N> {
  return h.element(name, attributes, children, style);
}

/**
 * @public
 */
export namespace h {
  export function element<N extends string = string>(
    name: N,
    attributes: Array<Attribute> | Record<string, string | boolean> = [],
    children: Array<Node | string> = [],
    style: Array<Declaration> | Record<string, string> = [],
    namespace?: Namespace
  ): Element<N> {
    attributes = Array.isArray(attributes)
      ? attributes
      : entries(attributes).reduce<Array<Attribute>>(
          (attributes, [name, value]) => {
            if (value === false) {
              return attributes;
            }

            return [
              ...attributes,
              h.attribute(hyphenate(name), value === true ? "" : value),
            ];
          },
          []
        );

    const block = h.block(style);

    if (style.length > 0) {
      attributes = [...attributes, h.attribute("style", block.toString())];
    }

    namespace =
      namespace ??
      Option.from(attributes.find((attribute) => attribute.name === "xmlns"))
        .map((attribute) => attribute.value)
        .filter(Namespace.isNamespace)
        .getOr(defaultNamespace(name));

    const content = children.find(Document.isDocument);
    const shadow = children.find(Shadow.isShadow);

    const element = Element.of(
      Option.of(namespace),
      None,
      name,
      attributes,
      children
        .filter(nor(Document.isDocument, Shadow.isShadow))
        .map((child) => (typeof child === "string" ? h.text(child) : child)),
      style.length === 0 ? None : Option.of(block)
    );

    if (content !== undefined) {
      element._attachContent(content);
    }

    if (shadow !== undefined) {
      element._attachShadow(shadow);
    }

    return element;
  }

  export function attribute<N extends string = string>(
    name: N,
    value: string
  ): Attribute<N> {
    return Attribute.of(None, None, name, value);
  }

  export function text(data: string): Text {
    return Text.of(data);
  }

  export function document(
    children: Array<Node | string>,
    style?: Array<Sheet>
  ): Document {
    return Document.of(
      children.map((child) =>
        typeof child === "string" ? text(child) : child
      ),
      style
    );
  }

  export function shadow(
    children: Array<Node | string>,
    style?: Array<Sheet>,
    mode?: Shadow.Mode
  ): Shadow {
    return Shadow.of(
      children!.map((child) =>
        typeof child === "string" ? text(child) : child
      ),
      style,
      mode
    );
  }

  export function type<N extends string = string>(
    name: N,
    publicId?: string,
    systemId?: string
  ): Type<N> {
    return Type.of(name, Option.from(publicId), Option.from(systemId));
  }

  export function fragment(children: Array<Node | string>): Fragment {
    return Fragment.of(
      children.map((child) => (typeof child === "string" ? text(child) : child))
    );
  }

  export function sheet(
    rules: Array<Rule>,
    disabled?: boolean,
    condition?: string
  ): Sheet {
    return Sheet.of(rules, disabled, Option.from(condition));
  }

  export function block(
    declarations: Array<Declaration> | Record<string, string>
  ): Block {
    return Block.of(
      Array.isArray(declarations)
        ? declarations
        : entries(declarations).map(([name, value]) => {
            const important = value.endsWith("!important");

            value = value.replace(/!important$/, "").trim();

            // Hyphenate the declaration name unless it's the name of a custom
            // property; these we keep as-is.
            if (!name.startsWith("--")) {
              name = hyphenate(name);
            }

            return Declaration.of(name, value, important);
          })
    );
  }

  export function declaration(
    name: string,
    value: string,
    important?: boolean
  ): Declaration {
    return Declaration.of(name, value, important);
  }

  export namespace rule {
    export function fontFace(
      declarations: Array<Declaration> | Record<string, string>
    ): FontFaceRule {
      return FontFaceRule.of(block(declarations));
    }

    export function keyframe(
      key: string,
      declarations: Array<Declaration> | Record<string, string>
    ): KeyframeRule {
      return KeyframeRule.of(key, block(declarations));
    }

    export function keyframes(name: string, rules: Array<Rule>): KeyframesRule {
      return KeyframesRule.of(name, rules);
    }

    export function media(condition: string, rules: Array<Rule>): MediaRule {
      return MediaRule.of(condition, rules);
    }

    export function namespace(
      namespace: string,
      prefix?: string
    ): NamespaceRule {
      return NamespaceRule.of(namespace, Option.from(prefix));
    }

    export function page(
      selector: string,
      declarations: Array<Declaration> | Record<string, string>
    ): PageRule {
      return PageRule.of(selector, block(declarations));
    }

    export function style(
      selector: string,
      declarations: Array<Declaration> | Record<string, string>,
      hint?: boolean
    ): StyleRule {
      return StyleRule.of(selector, block(declarations), hint);
    }

    export function supports(
      condition: string,
      rules: Array<Rule>
    ): SupportsRule {
      return SupportsRule.of(condition, rules);
    }
  }
}

function hyphenate(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function defaultNamespace(name: string): Namespace {
  switch (name) {
    // The <a> element exists both in SVG and HTML namespaces.
    // It is defaulted in the HTML namespace and must be explicitly built in
    // the SVG one if needed.
    case "circle":
    case "ellipse":
    case "foreignObject":
    case "g":
    case "image":
    case "line":
    case "mesh":
    case "path":
    case "polygon":
    case "polyline":
    case "rect":
    case "svg":
    case "symbol":
    case "text":
    case "textPath":
    case "use":
      return Namespace.SVG;
    case "annotation":
    case "annotation-xml":
    case "maction":
    case "math":
    case "merror":
    case "mfrac":
    case "mi":
    case "mmultiscripts":
    case "mn":
    case "mo":
    case "mover":
    case "mpadded":
    case "mphantom":
    case "mprescripts":
    case "mroot":
    case "mrow":
    case "ms":
    case "mspace":
    case "msqrt":
    case "mstyle":
    case "msub":
    case "msubsup":
    case "msup":
    case "mtable":
    case "mtd":
    case "mtext":
    case "mtr":
    case "munder":
    case "munderover":
    case "none":
    case "semantics":
      return Namespace.MathML;
    default:
      return Namespace.HTML;
  }
}
