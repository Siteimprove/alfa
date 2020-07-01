import { Option, None } from "@siteimprove/alfa-option";

import { Namespace } from "./namespace";

import { Node } from "./node";
import { Attribute } from "./node/attribute";
import { Document } from "./node/document";
import { Element } from "./node/element";
import { Fragment } from "./node/fragment";
import { Text } from "./node/text";
import { Type } from "./node/type";

import { Block } from "./style/block";
import { Declaration } from "./style/declaration";
import {
  Rule,
  FontFaceRule,
  KeyframeRule,
  KeyframesRule,
  MediaRule,
  NamespaceRule,
  PageRule,
  StyleRule,
  SupportsRule,
} from "./style/rule";
import { Sheet } from "./style/sheet";

const { entries } = Object;

export function h(
  name: string,
  attributes: Array<Attribute> | Record<string, string | boolean> = [],
  children: Array<Node | string> = [],
  style: Array<Declaration> | Record<string, string> = []
): Element {
  return h.element(name, attributes, children, style);
}

export namespace h {
  export function element(
    name: string,
    attributes: Array<Attribute> | Record<string, string | boolean> = [],
    children: Array<Node | string> = [],
    style: Array<Declaration> | Record<string, string> = []
  ): Element {
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

    let namespace = Namespace.HTML;

    switch (name) {
      case "svg":
        namespace = Namespace.SVG;
        break;
      case "math":
        namespace = Namespace.MathML;
    }

    return Element.of(
      Option.of(namespace),
      None,
      name,
      attributes,
      children.map((child) =>
        typeof child === "string" ? h.text(child) : child
      ),
      style.length === 0 ? None : Option.of(block)
    );
  }

  export function attribute(name: string, value: string): Attribute {
    return Attribute.of(None, None, name, value);
  }

  export function text(data: string): Text {
    return Text.of(data);
  }

  export function document(
    children: Array<Node | string>,
    style: Array<Sheet> = []
  ): Document {
    return Document.of(
      children.map((child) =>
        typeof child === "string" ? text(child) : child
      ),
      style
    );
  }

  export function type(
    name: string,
    publicId: string | null = null,
    systemId: string | null = null
  ): Type {
    return Type.of(name, Option.from(publicId), Option.from(systemId));
  }

  export function fragment(children: Array<Node | string>): Fragment {
    return Fragment.of(
      children.map((child) => (typeof child === "string" ? text(child) : child))
    );
  }

  export function sheet(
    rules: Array<Rule>,
    disabled: boolean = false,
    condition: string | null = null
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

            return Declaration.of(hyphenate(name), value, important);
          })
    );
  }

  export function declaration(
    name: string,
    value: string,
    important: boolean = false
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
      prefix: string | null = null
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
      declarations: Array<Declaration> | Record<string, string>
    ): StyleRule {
      return StyleRule.of(selector, block(declarations));
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
