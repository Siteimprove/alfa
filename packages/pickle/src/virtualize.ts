import { set, map, slice } from "@siteimprove/alfa-util";
import * as V from "@siteimprove/alfa-dom";

export function virtualize(node: Node): V.Node {
  return virtualizeNode(node);
}

function virtualizeNode(node: Node): V.Node {
  switch (node.nodeType) {
    case node.ELEMENT_NODE:
      return virtualizeElement(node as Element);
    case node.TEXT_NODE:
      return virtualizeText(node as Text);
    case node.COMMENT_NODE:
      return virtualizeComment(node as Comment);
    case node.DOCUMENT_NODE:
      return virtualizeDocument(node as Document);
    case node.DOCUMENT_TYPE_NODE:
      return virtualizeDocumentType(node as DocumentType);
    case node.DOCUMENT_FRAGMENT_NODE:
      return virtualizeDocumentFragment(node as DocumentFragment);
  }

  throw new Error(`Cannot virtualize node of type "${node.nodeType}"`);
}

function virtualizeElement(element: Element): V.Element {
  const virtual: V.Element = {
    nodeType: 1,
    childNodes: map(element.childNodes, child => virtualizeNode(child)),
    namespaceURI: element.namespaceURI,
    prefix: element.prefix,
    localName: element.localName || "",
    attributes: map(element.attributes, attribute => ({
      namespaceURI: attribute.namespaceURI,
      prefix: attribute.prefix,
      localName: attribute.localName || "",
      value: attribute.value
    })),
    shadowRoot: null
  };

  if (element.shadowRoot !== null) {
    set(
      virtual,
      "shadowRoot",
      virtualizeShadowRoot(element.shadowRoot, virtual)
    );
  }

  return virtual;
}

function virtualizeText({ data }: Text): V.Text {
  return { nodeType: 3, childNodes: [], data };
}

function virtualizeComment({ data }: Comment): V.Comment {
  return { nodeType: 8, childNodes: [], data };
}

function virtualizeDocument(document: Document): V.Document {
  const virtual: V.Document = {
    nodeType: 9,
    childNodes: map(document.childNodes, child => virtualizeNode(child)),
    styleSheets: map(document.styleSheets, styleSheet =>
      virtualizeStyleSheet(styleSheet as CSSStyleSheet)
    )
  };

  return virtual;
}

function virtualizeDocumentType({ name }: DocumentType): V.DocumentType {
  return { nodeType: 10, childNodes: [], name };
}

function virtualizeDocumentFragment(
  documentFragment: DocumentFragment
): V.DocumentFragment {
  const virtual: V.DocumentFragment = {
    nodeType: 11,
    childNodes: map(documentFragment.childNodes, child => virtualizeNode(child))
  };

  return virtual;
}

function virtualizeShadowRoot(
  shadowRoot: ShadowRoot,
  host: V.Element
): V.ShadowRoot {
  const virtual: V.ShadowRoot = {
    nodeType: 11,
    childNodes: map(shadowRoot.childNodes, child => virtualizeNode(child))
  };

  return virtual;
}

function virtualizeStyleSheet(styleSheet: CSSStyleSheet): V.StyleSheet {
  return {
    disabled: styleSheet.disabled,
    cssRules: map(styleSheet.cssRules, cssRule => virtualizeRule(cssRule))
  };
}

function virtualizeStyleDeclaration(
  styleDeclaration: CSSStyleDeclaration
): V.StyleDeclaration {
  return {
    cssText: styleDeclaration.cssText
  };
}

function virtualizeRule(rule: CSSRule): V.Rule {
  switch (rule.type) {
    case rule.STYLE_RULE:
      return virtualizeStyleRule(rule as CSSStyleRule);
    case rule.MEDIA_RULE:
      return virtualizeMediaRule(rule as CSSMediaRule);
    case rule.FONT_FACE_RULE:
      return virtualizeFontFaceRule(rule as CSSFontFaceRule);
    case rule.PAGE_RULE:
      return virtualizePageRule(rule as CSSPageRule);
    case rule.KEYFRAMES_RULE:
      return virtualizeKeyframesRule(rule as CSSKeyframesRule);
    case rule.KEYFRAME_RULE:
      return virtualizeKeyframeRule(rule as CSSKeyframeRule);
    case rule.NAMESPACE_RULE:
      return virtualizeNamespaceRule(rule as CSSNamespaceRule);
    case rule.SUPPORTS_RULE:
      return virtualizeSupportsRule(rule as CSSSupportsRule);
  }

  throw new Error(`Cannot virtualize rule of type ${rule.type}`);
}

function virtualizeStyleRule(styleRule: CSSStyleRule): V.StyleRule {
  return {
    type: 1,
    selectorText: styleRule.selectorText,
    style: virtualizeStyleDeclaration(styleRule.style)
  };
}

function virtualizeImportRule(importRule: CSSImportRule): V.ImportRule {
  return {
    type: 3,
    href: importRule.href,
    media: slice(importRule.media),
    styleSheet: virtualizeStyleSheet(importRule.styleSheet)
  };
}

function virtualizeMediaRule(mediaRule: CSSMediaRule): V.MediaRule {
  return {
    type: 4,
    cssRules: map(mediaRule.cssRules, rule => virtualizeRule(rule)),
    media: slice(mediaRule.media)
  };
}

function virtualizeFontFaceRule(fontFaceRule: CSSFontFaceRule): V.FontFaceRule {
  return {
    type: 5,
    style: virtualizeStyleDeclaration(fontFaceRule.style)
  };
}

function virtualizePageRule(pageRule: CSSPageRule): V.PageRule {
  return {
    type: 6,
    selectorText: pageRule.selectorText,
    style: virtualizeStyleDeclaration(pageRule.style)
  };
}

function virtualizeKeyframesRule(
  keyframesRule: CSSKeyframesRule
): V.KeyframesRule {
  return {
    type: 7,
    name: keyframesRule.name,
    cssRules: map(keyframesRule.cssRules, rule => virtualizeRule(rule))
  };
}

function virtualizeKeyframeRule(keyframeRule: CSSKeyframeRule): V.KeyframeRule {
  return {
    type: 8,
    keyText: keyframeRule.keyText,
    style: virtualizeStyleDeclaration(keyframeRule.style)
  };
}

function virtualizeNamespaceRule(
  namespaceRule: CSSNamespaceRule
): V.NamespaceRule {
  return {
    type: 10,
    namespaceURI: namespaceRule.namespaceURI,
    prefix: namespaceRule.prefix
  };
}

function virtualizeSupportsRule(supportsRule: CSSSupportsRule): V.SupportsRule {
  return {
    type: 12,
    cssRules: map(supportsRule.cssRules, rule => virtualizeRule(rule)),
    conditionText: supportsRule.conditionText
  };
}
