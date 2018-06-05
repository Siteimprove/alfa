import * as V from "@siteimprove/alfa-dom";

const { assign } = Object;

export function virtualizeNode(node: Node): V.Node {
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
    prefix: element.prefix,
    localName: element.localName || "",
    attributes: Array.from(element.attributes).map(attribute => ({
      prefix: attribute.prefix,
      localName: attribute.localName || "",
      value: attribute.value
    })),
    shadowRoot: null,
    childNodes: Array.from(element.childNodes).map(child =>
      virtualizeNode(child)
    )
  };

  if (element.shadowRoot !== null) {
    assign(virtual, {
      shadowRoot: virtualizeShadowRoot(element.shadowRoot, virtual)
    });
  }

  return virtual;
}

function virtualizeText(text: Text): V.Text {
  return { nodeType: 3, data: text.data, childNodes: [] };
}

function virtualizeComment(comment: Comment): V.Comment {
  return { nodeType: 8, data: comment.data, childNodes: [] };
}

function virtualizeDocument(document: Document): V.Document {
  return {
    nodeType: 9,
    childNodes: Array.from(document.childNodes).map(child =>
      virtualizeNode(child)
    ),
    styleSheets: Array.from(document.styleSheets).map(styleSheet =>
      virtualizeStyleSheet(styleSheet as CSSStyleSheet)
    )
  };
}

function virtualizeDocumentType(documentType: DocumentType): V.DocumentType {
  return { nodeType: 10, name: documentType.name, childNodes: [] };
}

function virtualizeDocumentFragment(
  documentFragment: DocumentFragment
): V.DocumentFragment {
  return {
    nodeType: 11,
    childNodes: Array.from(documentFragment.childNodes).map(child =>
      virtualizeNode(child)
    )
  };
}

function virtualizeShadowRoot(
  shadowRoot: ShadowRoot,
  host: V.Element
): V.ShadowRoot {
  return {
    nodeType: 11,
    childNodes: Array.from(shadowRoot.childNodes).map(child =>
      virtualizeNode(child)
    ),
    // We can only ever access open shadow roots, so the `mode` will always be
    // "open". If it were "closed", we would have never gotten this far.
    mode: "open"
  };
}

function virtualizeStyleSheet(styleSheet: CSSStyleSheet): V.StyleSheet {
  return {
    cssRules: Array.from(styleSheet.cssRules).map(cssRule =>
      virtualizeRule(cssRule)
    )
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
    case rule.IMPORT_RULE:
      return virtualizeImportRule(rule as CSSImportRule);
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
    media: Array.from(importRule.media),
    styleSheet: virtualizeStyleSheet(importRule.styleSheet)
  };
}

function virtualizeMediaRule(mediaRule: CSSMediaRule): V.MediaRule {
  return {
    type: 4,
    cssRules: Array.from(mediaRule.cssRules).map(rule => virtualizeRule(rule)),
    media: Array.from(mediaRule.media)
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
    cssRules: Array.from(keyframesRule.cssRules).map(rule =>
      virtualizeRule(rule)
    )
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
    cssRules: Array.from(supportsRule.cssRules).map(rule =>
      virtualizeRule(rule)
    ),
    conditionText: supportsRule.conditionText
  };
}
