/// <reference lib="dom" />

import type {
  Attribute,
  Block,
  Comment,
  Document,
  Element,
  FontFaceRule,
  ImportRule,
  KeyframeRule,
  KeyframesRule,
  MediaRule,
  NamespaceRule,
  Node,
  PageRule,
  Rule,
  Sheet,
  StyleRule,
  SupportsRule,
  Text,
  Type,
  Shadow,
} from ".";

/**
 * @internal
 */
export namespace Native {
  export function fromNode(node: globalThis.Element): Element.JSON;

  export function fromNode(node: globalThis.Attr): Attribute.JSON;

  export function fromNode(node: globalThis.Text): Text.JSON;

  export function fromNode(node: globalThis.Comment): Comment.JSON;

  export function fromNode(node: globalThis.Document): Document.JSON;

  export function fromNode(node: globalThis.DocumentType): Type.JSON;

  export function fromNode(node: globalThis.Node): Node.JSON;

  export function fromNode(node: globalThis.Node): Node.JSON {
    return toNode(node);

    function toNode(node: globalThis.Node): Node.JSON {
      switch (node.nodeType) {
        case node.ELEMENT_NODE:
          return toElement(node as globalThis.Element);

        case node.ATTRIBUTE_NODE:
          return toAttribute(node as globalThis.Attr);

        case node.TEXT_NODE:
          return toText(node as globalThis.Text);

        case node.COMMENT_NODE:
          return toComment(node as globalThis.Comment);

        case node.DOCUMENT_NODE:
          return toDocument(node as globalThis.Document);

        case node.DOCUMENT_TYPE_NODE:
          return toType(node as globalThis.DocumentType);
      }

      throw new Error(`Unsupported node of type: ${node.nodeType}`);
    }

    function toElement(
      element:
        | globalThis.Element
        | globalThis.HTMLElement
        | globalThis.HTMLIFrameElement
        | globalThis.SVGElement
    ): Element.JSON {
      return {
        type: "element",
        namespace: element.namespaceURI,
        prefix: element.prefix,
        name: element.localName,
        attributes: map(element.attributes, toAttribute),
        style: "style" in element ? toBlock(element.style) : null,
        children: map(element.childNodes, toNode),
        shadow:
          element.shadowRoot !== null ? toShadow(element.shadowRoot) : null,
        content:
          "contentDocument" in element && element.contentDocument !== null
            ? toDocument(element.contentDocument)
            : null,
      };
    }

    function toAttribute(attribute: globalThis.Attr): Attribute.JSON {
      return {
        type: "attribute",
        namespace: attribute.namespaceURI,
        prefix: attribute.prefix,
        name: attribute.localName,
        value: attribute.value,
      };
    }

    function toText(text: globalThis.Text): Text.JSON {
      return {
        type: "text",
        data: text.data,
      };
    }

    function toComment(comment: globalThis.Comment): Comment.JSON {
      return {
        type: "comment",
        data: comment.data,
      };
    }

    function toDocument(document: globalThis.Document): Document.JSON {
      return {
        type: "document",
        children: map(document.childNodes, toNode),
        style: map(document.styleSheets, toSheet),
      };
    }

    function toType(type: globalThis.DocumentType): Type.JSON {
      return {
        type: "type",
        name: type.name,
        publicId: type.publicId === "" ? null : type.publicId,
        systemId: type.systemId === "" ? null : type.systemId,
      };
    }

    function toShadow(shadow: globalThis.ShadowRoot): Shadow.JSON {
      return {
        type: "shadow",
        mode: shadow.mode,
        children: map(shadow.childNodes, toNode),
        style: map(shadow.styleSheets, toSheet),
      };
    }

    function toSheet(sheet: globalThis.CSSStyleSheet): Sheet.JSON {
      let rules: Array<Rule.JSON>;

      try {
        rules = map(sheet.cssRules, toRule);
      } catch {
        rules = [];
      }

      return {
        rules,
        disabled: sheet.disabled,
        condition: sheet.media.mediaText === "" ? null : sheet.media.mediaText,
      };
    }

    function toRule(rule: globalThis.CSSRule): Rule.JSON {
      switch (rule.type) {
        case rule.STYLE_RULE:
          return toStyleRule(rule as globalThis.CSSStyleRule);

        case rule.IMPORT_RULE:
          return toImportRule(rule as globalThis.CSSImportRule);

        case rule.MEDIA_RULE:
          return toMediaRule(rule as globalThis.CSSMediaRule);

        case rule.FONT_FACE_RULE:
          return toFontFaceRule(rule as globalThis.CSSFontFaceRule);

        case rule.PAGE_RULE:
          return toPageRule(rule as globalThis.CSSPageRule);

        case rule.KEYFRAMES_RULE:
          return toKeyframesRule(rule as globalThis.CSSKeyframesRule);

        case rule.KEYFRAME_RULE:
          return toKeyframeRule(rule as globalThis.CSSKeyframeRule);

        case rule.NAMESPACE_RULE:
          return toNamespaceRule(rule as globalThis.CSSNamespaceRule);

        case rule.SUPPORTS_RULE:
          return toSupportsRule(rule as globalThis.CSSSupportsRule);
      }

      throw new Error(`Unsupported rule of type: ${rule.type}`);
    }

    function toStyleRule(styleRule: globalThis.CSSStyleRule): StyleRule.JSON {
      return {
        type: "style",
        selector: styleRule.selectorText,
        style: toBlock(styleRule.style),
      };
    }

    function toImportRule(rule: globalThis.CSSImportRule): ImportRule.JSON {
      return {
        type: "import",
        rules: toSheet(rule.styleSheet).rules,
        condition: rule.media.mediaText === "" ? "all" : rule.media.mediaText,
        href: rule.href,
      };
    }

    function toMediaRule(rule: globalThis.CSSMediaRule): MediaRule.JSON {
      let rules: Array<Rule.JSON>;

      try {
        rules = map(rule.cssRules, toRule);
      } catch {
        rules = [];
      }

      return {
        type: "media",
        condition: rule.conditionText,
        rules,
      };
    }

    function toFontFaceRule(
      rule: globalThis.CSSFontFaceRule
    ): FontFaceRule.JSON {
      return {
        type: "font-face",
        style: toBlock(rule.style),
      };
    }

    function toPageRule(rule: globalThis.CSSPageRule): PageRule.JSON {
      return {
        type: "page",
        selector: rule.selectorText,
        style: toBlock(rule.style),
      };
    }

    function toKeyframesRule(
      rule: globalThis.CSSKeyframesRule
    ): KeyframesRule.JSON {
      let rules: Array<Rule.JSON>;

      try {
        rules = map(rule.cssRules, toRule);
      } catch {
        rules = [];
      }

      return {
        type: "keyframes",
        rules,
        name: rule.name,
      };
    }

    function toKeyframeRule(
      rule: globalThis.CSSKeyframeRule
    ): KeyframeRule.JSON {
      return {
        type: "keyframe",
        key: rule.keyText,
        style: toBlock(rule.style),
      };
    }

    function toNamespaceRule(
      rule: globalThis.CSSNamespaceRule
    ): NamespaceRule.JSON {
      return {
        type: "namespace",
        namespace: rule.namespaceURI,
        prefix: rule.prefix,
      };
    }

    function toSupportsRule(
      rule: globalThis.CSSSupportsRule
    ): SupportsRule.JSON {
      let rules: Array<Rule.JSON>;

      try {
        rules = map(rule.cssRules, toRule);
      } catch {
        rules = [];
      }

      return {
        type: "supports",
        condition: rule.conditionText,
        rules,
      };
    }

    function toBlock(block: globalThis.CSSStyleDeclaration): Block.JSON {
      return map(block, (name) => {
        return {
          name,
          value: block.getPropertyValue(name),
          important: block.getPropertyPriority(name) === "important",
        };
      });
    }

    function map<T, U>(
      arrayLike: ArrayLike<T>,
      mapper: (value: T) => U
    ): Array<U> {
      const result = new Array<U>(arrayLike.length);

      for (let i = 0, n = arrayLike.length; i < n; i++) {
        result[i] = mapper(arrayLike[i]);
      }

      return result;
    }
  }
}
