/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import {
  Attribute,
  Block,
  Comment,
  Declaration,
  Document,
  Element,
  ImportRule,
  Node,
  Rule,
  Sheet,
  StyleRule,
  Text,
  Type
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";
import { JSHandle } from "puppeteer";

const { isFunction, isObject } = Predicate;

export namespace Puppeteer {
  export type Type = JSHandle<globalThis.Document>;

  export function isType(value: unknown): value is Type {
    return isObject(value) && isFunction(value.dispose);
  }

  export async function asPage(value: Type): Promise<Page> {
    const document = await value.evaluate(document => {
      return toDocument(document);

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
          | globalThis.SVGElement
      ): Element.JSON {
        return {
          type: "element",
          namespace: element.namespaceURI,
          prefix: element.prefix,
          name: element.localName,
          attributes: [...element.attributes].map(toAttribute),
          style: "style" in element ? toBlock(element.style) : null,
          children: [...element.childNodes].map(toNode),
          shadow: null,
          content: null
        };
      }

      function toAttribute(attribute: globalThis.Attr): Attribute.JSON {
        return {
          type: "attribute",
          namespace: attribute.namespaceURI,
          prefix: attribute.prefix,
          name: attribute.localName,
          value: attribute.value
        };
      }

      function toText(text: globalThis.Text): Text.JSON {
        return {
          type: "text",
          data: text.data
        };
      }

      function toComment(comment: globalThis.Comment): Comment.JSON {
        return {
          type: "comment",
          data: comment.data
        };
      }

      function toDocument(document: globalThis.Document): Document.JSON {
        return {
          type: "document",
          children: [...document.childNodes].map(toNode),
          style: [...document.styleSheets].map(sheet =>
            toSheet(sheet as CSSStyleSheet)
          )
        };
      }

      function toType(type: globalThis.DocumentType): Type.JSON {
        return {
          type: "type",
          name: type.name,
          publicId: type.publicId === "" ? null : type.publicId,
          systemId: type.systemId === "" ? null : type.systemId
        };
      }

      function toSheet(sheet: globalThis.CSSStyleSheet): Sheet.JSON {
        return {
          rules: [...sheet.cssRules].map(toRule),
          disabled: sheet.disabled
        };
      }

      function toRule(rule: globalThis.CSSRule): Rule.JSON {
        switch (rule.type) {
          case rule.STYLE_RULE:
            return toStyleRule(rule as globalThis.CSSStyleRule);

          case rule.IMPORT_RULE:
            return toImportRule(rule as globalThis.CSSImportRule);
        }

        throw new Error(`Unsupported rule of type: ${rule.type}`);
      }

      function toStyleRule(styleRule: globalThis.CSSStyleRule): StyleRule.JSON {
        return {
          type: "style",
          selector: styleRule.selectorText,
          style: toBlock(styleRule.style)
        };
      }

      function toImportRule(rule: globalThis.CSSImportRule): ImportRule.JSON {
        return {
          type: "import",
          rules: toSheet(rule.styleSheet as globalThis.CSSStyleSheet).rules,
          condition: rule.media.mediaText,
          href: rule.href
        };
      }

      function toBlock(block: globalThis.CSSStyleDeclaration): Block.JSON {
        const declarations: Array<Declaration.JSON> = [];

        for (let i = 0, n = block.length; i < n; i++) {
          const name = block.item(i);
          const value = block.getPropertyValue(name);
          const important = block.getPropertyPriority(name) === "important";

          declarations.push({ name, value, important });
        }

        return declarations;
      }
    });

    return Page.of({ document: Document.fromDocument(document) });
  }
}
