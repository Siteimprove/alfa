/// <reference lib="dom" />

/**
 * The function defined in this file is destined to be injected into a browser
 * page, either through a web extension or browser automation tool.
 *
 * As such, it must be serializable, meaning it must not reference any external
 * file (only import type are allowed), and may not use annex functions (who
 * must instead be inlined in the main function).
 *
 * We could use Webpack or the like to bundle the current file with its
 * dependencies into a single file. This is however somewhat heavy-handed, and
 * the rest of Alfa has no need for such complex machinery, so we stick to a
 * simple solution for now.
 */

import type { Rectangle } from "@siteimprove/alfa-rectangle";
import type {
  Attribute,
  Comment,
  Document,
  Element,
  FontFaceRule,
  ImportRule,
  KeyframeRule,
  KeyframesRule,
  Layer,
  MediaRule,
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
} from "./index.js";

/**
 * @internal
 */
export namespace Native {
  export async function fromNode(
    node: globalThis.Element,
    options?: Options,
  ): Promise<Element.JSON>;

  export async function fromNode(
    node: globalThis.Attr,
    options?: Options,
  ): Promise<Attribute.JSON>;

  export async function fromNode(
    node: globalThis.Text,
    options?: Options,
  ): Promise<Text.JSON>;

  export async function fromNode(
    node: globalThis.Comment,
    options?: Options,
  ): Promise<Comment.JSON>;

  export async function fromNode(
    node: globalThis.Document,
    options?: Options,
  ): Promise<Document.JSON>;

  export async function fromNode(
    node: globalThis.DocumentType,
    options?: Options,
  ): Promise<Type.JSON>;

  export async function fromNode(
    node: globalThis.Node,
    options?: Options,
  ): Promise<Node.JSON>;

  export async function fromNode(
    node: globalThis.Node,
    options?: Options,
  ): Promise<Node.JSON> {
    const { withCrossOrigin = false } = options ?? {};

    return toNode(node);

    async function toNode(node: globalThis.Node): Promise<Node.JSON> {
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

    async function toElement(
      element:
        | globalThis.Element
        | globalThis.HTMLElement
        | globalThis.HTMLIFrameElement
        | globalThis.SVGElement,
    ): Promise<Element.JSON> {
      return {
        type: "element",
        namespace: element.namespaceURI,
        prefix: element.prefix,
        name: element.localName,
        attributes: map(element.attributes, toAttribute),
        style: "style" in element ? toBlock(element.style) : null,
        children: await mapAsync(element.childNodes, toNode),
        shadow:
          element.shadowRoot !== null
            ? await toShadow(element.shadowRoot)
            : null,
        content:
          "contentDocument" in element && element.contentDocument !== null
            ? await toDocument(element.contentDocument)
            : null,
        box: toRectangle(element.getBoundingClientRect()),
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

    async function toDocument(
      document: globalThis.Document,
    ): Promise<Document.JSON> {
      if (withCrossOrigin) {
        await ensureCrossOrigin(document);
      }

      return {
        type: "document",
        children: await mapAsync(document.childNodes, toNode),
        style: getStyleSheets(document),
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

    async function toShadow(
      shadow: globalThis.ShadowRoot,
    ): Promise<Shadow.JSON> {
      if (withCrossOrigin) {
        await ensureCrossOrigin(document);
      }

      return {
        type: "shadow",
        mode: shadow.mode,
        children: await mapAsync(shadow.childNodes, toNode),
        style: getStyleSheets(shadow),
      };
    }

    /**
     * @privateRemarks
     * Adopted stylesheets are assumed to be ordered after document stylesheets.
     *
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets}
     */
    function getStyleSheets(
      docOrShadow: globalThis.Document | globalThis.ShadowRoot,
    ): Array<Sheet.JSON> {
      return [
        ...map(docOrShadow.styleSheets, toSheet),
        ...map(docOrShadow.adoptedStyleSheets, toSheet),
      ];
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
        condition:
          // Sheets generated by pre-renderers like JSDOM do not contain media
          // at all.
          // OTOH, the MediaList.mediaText interface treat null as the empty
          // string, so we must do the same here (in the other direction).
          (sheet?.media?.mediaText ?? "") === "" ? null : sheet.media.mediaText,
      };
    }

    function toRule(rule: globalThis.CSSRule): Rule.JSON {
      // In the best case, rule.constructor.name works and everything is fine.
      switch (rule.constructor.name) {
        case "CSSFontFaceRule":
          return toFontFaceRule(rule as globalThis.CSSFontFaceRule);

        case "CSSImportRule":
          return toImportRule(rule as globalThis.CSSImportRule);

        case "CSSKeyframeRule":
          return toKeyframeRule(rule as globalThis.CSSKeyframeRule);

        case "CSSKeyframesRule":
          return toKeyframesRule(rule as globalThis.CSSKeyframesRule);

        case "CSSLayerBlockRule":
          return toLayerBlockRule(rule as globalThis.CSSLayerBlockRule);

        case "CSSLayerStatementRule":
          return toLayerStatementRule(rule as globalThis.CSSLayerStatementRule);

        case "CSSMediaRule":
          return toMediaRule(rule as globalThis.CSSMediaRule);

        case "CSSNamespaceRule":
          return toNamespaceRule(rule as globalThis.CSSNamespaceRule);

        case "CSSPageRule":
          return toPageRule(rule as globalThis.CSSPageRule);

        case "CSSStyleRule":
          return toStyleRule(rule as globalThis.CSSStyleRule);

        case "CSSSupportsRule":
          return toSupportsRule(rule as globalThis.CSSSupportsRule);
      }

      // In some case (June 2024: in Firefox), rule.constructor.name returns
      // undefined when used from an extension's content script. This is likely
      // due to the fact that the rule has been created in the "page" world,
      // but this code is evaluated in a content script world which does not
      // have access to the actual constructor.
      // However, in that case, .toString() seems to work… Since it may have been
      // redefined along the prototype chain, we make sure to use the basic one.
      // see https://stackoverflow.com/questions/43616128/undefined-javascript-object-constructor
      switch (Object.prototype.toString.apply(rule)) {
        case "[object CSSFontFaceRule]":
          return toFontFaceRule(rule as globalThis.CSSFontFaceRule);
        case "[object CSSImportRule]":
          return toImportRule(rule as globalThis.CSSImportRule);
        case "[object CSSKeyframeRule]":
          return toKeyframeRule(rule as globalThis.CSSKeyframeRule);
        case "[object CSSKeyframesRule]":
          return toKeyframesRule(rule as globalThis.CSSKeyframesRule);
        case "[object CSSLayerBlockRule]":
          return toLayerBlockRule(rule as globalThis.CSSLayerBlockRule);
        case "[object CSSLayerStatementRule]":
          return toLayerStatementRule(rule as globalThis.CSSLayerStatementRule);
        case "[object CSSMediaRule]":
          return toMediaRule(rule as globalThis.CSSMediaRule);
        case "[object CSSNamespaceRule]":
          return toNamespaceRule(rule as globalThis.CSSNamespaceRule);
        case "[object CSSPageRule]":
          return toPageRule(rule as globalThis.CSSPageRule);
        case "[object CSSStyleRule]":
          return toStyleRule(rule as globalThis.CSSStyleRule);
        case "[object CSSSupportsRule]":
          return toSupportsRule(rule as globalThis.CSSSupportsRule);
      }

      // If everything else failed, we default to the deprecated `type`.
      // This is clearly bad, notably because @layer rules where introduced
      // after the deprecation and thus do not have a `type` property.
      // But it might still save the show in some corner cases.
      switch (rule.type) {
        case CSSRule.FONT_FACE_RULE:
          return toFontFaceRule(rule as globalThis.CSSFontFaceRule);
        case CSSRule.IMPORT_RULE:
          return toImportRule(rule as globalThis.CSSImportRule);
        case CSSRule.KEYFRAME_RULE:
          return toKeyframeRule(rule as globalThis.CSSKeyframeRule);
        case CSSRule.KEYFRAMES_RULE:
          return toKeyframesRule(rule as globalThis.CSSKeyframesRule);
        // case "CSSLayerBlockRule":
        //   return toLayerBlockRule(rule);
        // case "CSSLayerStatementRule":
        //   return toLayerStatementRule(rule);
        case CSSRule.MEDIA_RULE:
          return toMediaRule(rule as globalThis.CSSMediaRule);
        case CSSRule.NAMESPACE_RULE:
          return toNamespaceRule(rule as globalThis.CSSNamespaceRule);
        case CSSRule.PAGE_RULE:
          return toPageRule(rule as globalThis.CSSPageRule);
        case CSSRule.STYLE_RULE:
          return toStyleRule(rule as globalThis.CSSStyleRule);
        case CSSRule.SUPPORTS_RULE:
          return toSupportsRule(rule as globalThis.CSSSupportsRule);
      }

      // If nothing worked, just crash.
      throw new Error(
        `Unsupported rule of type: ${rule.constructor.name} / ${Object.prototype.toString.apply(rule)} / ${rule.type}`,
      );
    }

    function toFontFaceRule(
      rule: globalThis.CSSFontFaceRule,
    ): FontFaceRule.JSON {
      return {
        type: "font-face",
        style: toBlock(rule.style),
      };
    }

    function toImportRule(rule: globalThis.CSSImportRule): ImportRule.JSON {
      return {
        type: "import",
        rules: rule.styleSheet === null ? [] : toSheet(rule.styleSheet).rules,
        condition: rule.media.mediaText === "" ? "all" : rule.media.mediaText,
        href: rule.href,
        supportText: rule.supportsText,
        layer: rule.layerName,
      };
    }

    function toKeyframeRule(
      rule: globalThis.CSSKeyframeRule,
    ): KeyframeRule.JSON {
      return {
        type: "keyframe",
        key: rule.keyText,
        style: toBlock(rule.style),
      };
    }

    function toKeyframesRule(
      rule: globalThis.CSSKeyframesRule,
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

    function toLayerBlockRule(
      rule: globalThis.CSSLayerBlockRule,
    ): Layer.BlockRule.JSON {
      return {
        type: "layer-block",
        layer: rule.name,
        rules: map(rule.cssRules, toRule),
      };
    }

    function toLayerStatementRule(
      rule: globalThis.CSSLayerStatementRule,
    ): Layer.StatementRule.JSON {
      return {
        type: "layer-statement",
        layers: [...rule.nameList],
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

    function toNamespaceRule(
      rule: globalThis.CSSNamespaceRule,
    ): NamespaceRule.JSON {
      return {
        type: "namespace",
        namespace: rule.namespaceURI,
        prefix: rule.prefix,
      };
    }

    function toPageRule(rule: globalThis.CSSPageRule): PageRule.JSON {
      return {
        type: "page",
        selector: rule.selectorText,
        style: toBlock(rule.style),
      };
    }

    function toStyleRule(styleRule: globalThis.CSSStyleRule): StyleRule.JSON {
      return {
        type: "style",
        selector: styleRule.selectorText,
        style: toBlock(styleRule.style),
      };
    }

    function toSupportsRule(
      rule: globalThis.CSSSupportsRule,
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

    /**
     * @privateRemarks
     * User Agents normally expose the pre-parsed declarations.
     * However, there is a corner case of shorthands whose value is a `var()`
     * where several UAs (as of April 2024: at least Chrome and Firefox) list
     * the **longhands** in their CSSStyleDeclaration object (in the enumerable
     * part), but associate no values to them, only to the corresponding
     * shorthand (as expected and declared). This causes attempts to access
     * the apparently declared properties through the `getPropertyValue()`
     * method to return an empty string.
     *
     * {@link https://github.com/Siteimprove/alfa/issues/1563}
     *
     * To circumvent that, we simply return the raw CSS text; and delegate parsing
     * to consumers, aka Block.from.
     *
     * Note that somehow JSDOM behaves differently and correctly associate the
     * value with the shorthand. This means that the local tests using JSDOM
     * are brittle and cannot detect a regression on this issue.
     */
    function toBlock(block: globalThis.CSSStyleDeclaration): string {
      return block.cssText;
    }

    function toRectangle(domRect: globalThis.DOMRect): Rectangle.JSON {
      return {
        type: "rectangle",
        x: domRect.x,
        y: domRect.y,
        width: domRect.width,
        height: domRect.height,
      };
    }

    function map<T, U>(
      arrayLike: ArrayLike<T>,
      mapper: (value: T) => U,
    ): Array<U> {
      const result = new Array<U>(arrayLike.length);

      for (let i = 0, n = arrayLike.length; i < n; i++) {
        result[i] = mapper(arrayLike[i]);
      }

      return result;
    }

    async function mapAsync<T, U>(
      arrayLike: ArrayLike<T>,
      mapper: (value: T) => U | Promise<U>,
    ): Promise<Array<U>> {
      const result = new Array<U>(arrayLike.length);

      for (let i = 0, n = arrayLike.length; i < n; i++) {
        result[i] = await mapper(arrayLike[i]);
      }

      return result;
    }

    /**
     * Ensure that the needed resources for the document or shadow root, such as
     * style sheets, adhere to CORS policy.
     */
    async function ensureCrossOrigin(
      documentOrShadowRoot: globalThis.Document | globalThis.ShadowRoot,
    ): Promise<void> {
      /**
       * Ensure that all `<link>` elements specify the `crossorigin` attribute.
       * Even `<link>` elements that reference same-origin resources will need
       * this attribute as they may contain nested resource imports that risk
       * violating CORS policy.
       *
       * Do keep in mind that this will only work for resources that also set
       * appropriate CORS request headers.
       */
      const links = documentOrShadowRoot.querySelectorAll("link");
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        /**
         * Skip `<link>` elements for which the `crossorigin` attribute is already
         * set to a valid value.
         */
        if (link.crossOrigin !== null) {
          continue;
        }

        /**
         * Simply setting the `crossorigin` attribute for the `<link>` element
         * will not work as it must be reevaluated. We therefore create a clone,
         * set the `crossorigin` attribute, and replace the original `<link>`
         * element.
         */
        const clone = link.cloneNode() as HTMLLinkElement;

        /**
         * Set the `crossorigin` attribute to `anonymous`, ensuring that
         * credentials are not sent as part of the cross-origin request. This is
         * incredibly important as we don't want to risk leaking credentials!
         */
        clone.crossOrigin = "anonymous";

        /**
         * Replace the original `<link>` element with its clone. For style sheets,
         * this will unfortunately cause a FOUC while the browser recomputes
         * styles.
         *
         * {@link https://en.wikipedia.org/wiki/Flash_of_unstyled_content}
         */
        link.parentNode!.replaceChild(clone, link);

        /**
         * While certain resources will load synchronously from cache, others will
         * not and we therefore need to await these.
         */
        if (shouldAwait(link)) {
          /**
           * Construct a promise that resolves once the `<link>` element either
           * loads successfully or fails to load. If the `<link>` element fails to
           * load, a request error will be logged to the console which should be
           * enough indication that something didn't go quite as expected. Either
           * way, we will deliver audit results even in the event of a missing
           * resource.
           */
          await new Promise<void>((resolve) =>
            ["load", "error"].forEach((event) =>
              clone.addEventListener(event, () => resolve()),
            ),
          );
        }
      }

      /**
       * Check if the given `<link>` element should be awaited.
       */
      function shouldAwait(link: HTMLLinkElement): boolean {
        /**
         * A `<link>` element with an empty `href` will cause the fetch process to
         * abort with no events to await.
         */
        if (link.getAttribute("href")?.trim() === "") {
          return false;
        }

        /**
         * Style sheets should be awaited as these are loaded and applied
         * asynchronously, often times causing additional resources to be loaded
         * via `url()` references and `@import` rules.
         */
        if (link.rel === "stylesheet") {
          return true;
        }

        return false;
      }
    }
  }

  export interface Options {
    /** Whether to enforce anonymous CORS on <link> missing one */
    withCrossOrigin?: boolean;
  }
}
