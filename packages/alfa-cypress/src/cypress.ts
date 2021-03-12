/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="cypress" />

// While it may be tempting to pull in @siteimprove/alfa-chai for this module as
// Cypress uses Chai for all its assertion methods, it's a trap! Cypress bundles
// its own copy of the TypeScript typings for Chai and so we have to avoid the
// two being referenced in the same compilation unit as they'd be considered
// incompatible.

import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Block,
  Comment,
  Declaration,
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
} from "@siteimprove/alfa-dom";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Request, Response } from "@siteimprove/alfa-http";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Page } from "@siteimprove/alfa-web";

import * as act from "@siteimprove/alfa-act";
import earl from "@siteimprove/alfa-formatter-earl";

declare global {
  namespace Chai {
    interface Assertion {
      accessible(): Promise<void>;
    }
  }

  namespace Cypress {
    interface Chainer<Subject> {
      (chainer: "be.accessible"): Chainable<Subject>;
      (chainer: "not.be.accessible"): Chainable<Subject>;
    }
  }
}

/**
 * @public
 */
export namespace Cypress {
  export function createPlugin<T = unknown, Q = never>(
    rules: Iterable<act.Rule<Page, T, Q>>,
    handlers: Iterable<Handler<Page, T, Q>> = [],
    options: Asserter.Options = {}
  ): globalThis.Chai.ChaiPlugin {
    const asserter = Asserter.of(rules, handlers, options);

    return (chai) => {
      chai.Assertion.addMethod("accessible", async function () {
        const input = toPage(this._obj);

        const result = await asserter.expect(input).to.be.accessible();

        const message = result.isOk() ? result.get() : result.getErr();

        this.assert(
          result.isOk(),
          `expected #{this} to be accessible${
            result.isErr() ? ` but ${message}` : ""
          }`,
          `expected #{this} to not be accessible${
            result.isOk() ? ` but ${message}` : ""
          }`,
          /* Expected */ true,
          /* Actual */ result.isOk(),
          /* Show diff */ false
        );
      });
    };
  }

  export type Type = globalThis.Node | globalThis.JQuery;

  export function toPage(value: Type): Page {
    if ("jquery" in value) {
      value = value.get(0);
    }

    const json = toJSON(value);

    return Page.of(
      Request.empty(),
      Response.empty(),
      json.type === "document"
        ? Document.from(json as Document.JSON)
        : Document.of([Node.from(json)]),
      Device.standard()
    );
  }

  function toJSON(value: globalThis.Node): Node.JSON {
    return toNode(value);

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
        content: null,
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
        children: [...document.childNodes].map(toNode),
        style: [...document.styleSheets].map((sheet) =>
          toSheet(sheet as CSSStyleSheet)
        ),
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

    function toSheet(sheet: globalThis.CSSStyleSheet): Sheet.JSON {
      return {
        rules: [...sheet.cssRules].map(toRule),
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
        rules: toSheet(rule.styleSheet as globalThis.CSSStyleSheet).rules,
        condition: rule.media.mediaText === "" ? "all" : rule.media.mediaText,
        href: rule.href,
      };
    }

    function toMediaRule(rule: globalThis.CSSMediaRule): MediaRule.JSON {
      return {
        type: "media",
        condition: rule.conditionText,
        rules: [...rule.cssRules].map(toRule),
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
      return {
        type: "keyframes",
        rules: [...rule.cssRules].map(toRule),
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
      return {
        type: "supports",
        condition: rule.conditionText,
        rules: [...rule.cssRules].map(toRule),
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
  }

  export namespace Handler {
    /**
     * @remarks
     * Cypress has this rather odd model of relying on synchronously enqueued
     * hooks and commands to provide a feeling of using a synchronous API. As
     * the handler will run _as part of_ a command, this means that we can't
     * register any additional commands when the handler runs; this must instead
     * be handled beforehand. The handler therefore starts by registering an
     * `after()` hook that will write any files collected during the test run
     * _after_ the tests are done.
     */
    export function persist<I, T, Q>(
      output: Mapper<I, string>,
      format: Formatter<I, T, Q> = earl()
    ): Handler<I, T, Q> {
      const files = new Map<string, string>();

      after(() => {
        for (const [file, data] of files) {
          cy.writeFile(file, data);
        }
      });

      return (input, rules, outcomes, message) => {
        const file = output(input);

        files.set(file, format(input, rules, outcomes) + "\n");

        return `${message}, see the full report at ${file}`;
      };
    }
  }
}
