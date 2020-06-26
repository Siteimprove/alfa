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
  attributes: Array<Attribute.JSON> | Record<string, string | boolean> = [],
  children: Array<Node.JSON | string> = [],
  style: Array<Declaration.JSON> | Record<string, string> = []
): Element.JSON {
  attributes = Array.isArray(attributes)
    ? attributes
    : entries(attributes).reduce<Array<Attribute.JSON>>(
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

  style = h.block(style);

  if (style.length > 0) {
    attributes = [
      ...attributes,
      h.attribute("style", Block.fromBlock(style).toString()),
    ];
  }

  const json: Element.JSON = {
    type: "element",
    namespace: Namespace.HTML,
    prefix: null,
    name,
    attributes,
    children: children.map((child) =>
      typeof child === "string" ? h.text(child) : child
    ),
    style,
    shadow: null,
    content: null,
  };

  switch (name) {
    case "svg":
      rename(json, Namespace.SVG);
      break;

    case "math":
      rename(json, Namespace.MathML);
  }

  return json;
}

export namespace h {
  export function attribute(name: string, value: string): Attribute.JSON {
    return {
      type: "attribute",
      namespace: null,
      prefix: null,
      name,
      value,
    };
  }

  export function text(data: string): Text.JSON {
    return {
      type: "text",
      data,
    };
  }

  export function document(
    children: Array<Node.JSON | string>,
    style: Array<Sheet.JSON> = []
  ): Document.JSON {
    return {
      type: "document",
      children: children.map((child) =>
        typeof child === "string" ? text(child) : child
      ),
      style,
    };
  }

  export function type(
    name: string,
    publicId: string | null = null,
    systemId: string | null = null
  ): Type.JSON {
    return {
      type: "type",
      name,
      publicId,
      systemId,
    };
  }

  export function fragment(children: Array<Node.JSON | string>): Fragment.JSON {
    return {
      type: "fragment",
      children: children.map((child) =>
        typeof child === "string" ? text(child) : child
      ),
    };
  }

  export function sheet(
    rules: Array<Rule.JSON>,
    disabled: boolean = false,
    condition: string | null = null
  ): Sheet.JSON {
    return {
      rules,
      disabled,
      condition,
    };
  }

  export function block(
    declarations: Array<Declaration.JSON> | Record<string, string>
  ): Block.JSON {
    return Array.isArray(declarations)
      ? declarations
      : entries(declarations).map(([name, value]) => {
          const important = value.endsWith("!important");

          value = value.replace(/\s+?!important$/, "");

          return {
            name: hyphenate(name),
            value,
            important,
          };
        });
  }

  export function declaration(
    name: string,
    value: string,
    important: boolean = false
  ): Declaration.JSON {
    return {
      name,
      value,
      important,
    };
  }

  export namespace rule {
    export function fontFace(
      declarations: Array<Declaration.JSON> | Record<string, string>
    ): FontFaceRule.JSON {
      return {
        type: "font-face",
        style: block(declarations),
      };
    }

    export function keyframe(
      key: string,
      declarations: Array<Declaration.JSON> | Record<string, string>
    ): KeyframeRule.JSON {
      return {
        type: "keyframe",
        key,
        style: block(declarations),
      };
    }

    export function keyframes(
      name: string,
      rules: Array<Rule.JSON>
    ): KeyframesRule.JSON {
      return {
        type: "keyframes",
        name,
        rules,
      };
    }

    export function media(
      condition: string,
      rules: Array<Rule.JSON>
    ): MediaRule.JSON {
      return {
        type: "media",
        condition,
        rules,
      };
    }

    export function namespace(
      namespace: string,
      prefix: string | null = null
    ): NamespaceRule.JSON {
      return {
        type: "namespace",
        namespace,
        prefix,
      };
    }

    export function page(
      selector: string,
      declarations: Array<Declaration.JSON> | Record<string, string>
    ): PageRule.JSON {
      return {
        type: "page",
        selector,
        style: block(declarations),
      };
    }

    export function style(
      selector: string,
      declarations: Array<Declaration.JSON> | Record<string, string>
    ): StyleRule.JSON {
      return {
        type: "style",
        selector,
        style: block(declarations),
      };
    }

    export function supports(
      condition: string,
      rules: Array<Rule.JSON>
    ): SupportsRule.JSON {
      return {
        type: "supports",
        condition,
        rules,
      };
    }
  }
}

function hyphenate(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function rename(element: Element.JSON, namespace: Namespace): void {
  element.namespace = namespace;

  for (const child of element.children) {
    if (child.type === "element") {
      rename(child as Element.JSON, namespace);
    }
  }
}
