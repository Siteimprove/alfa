function virtualizeNode(node: Node): import("@siteimprove/alfa-dom").Node {
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

function virtualizeElement(
  element: Element
): import("@siteimprove/alfa-dom").Element {
  const virtual: import("@siteimprove/alfa-dom").Element = {
    nodeType: 1,
    prefix: element.prefix,
    localName: element.localName === null ? "" : element.localName,
    attributes: Array.from(element.attributes).map(attribute => ({
      prefix: attribute.prefix,
      localName: attribute.localName === null ? "" : attribute.localName,
      value: attribute.value
    })),
    shadowRoot: null,
    childNodes: Array.from(element.childNodes).map(virtualizeNode)
  };

  if (element.shadowRoot !== null) {
    Object.assign(virtual, {
      shadowRoot: virtualizeShadowRoot(element.shadowRoot, virtual)
    });
  }

  return virtual;
}

function virtualizeText(text: Text): import("@siteimprove/alfa-dom").Text {
  return { nodeType: 3, data: text.data, childNodes: [] };
}

function virtualizeComment(
  comment: Comment
): import("@siteimprove/alfa-dom").Comment {
  return { nodeType: 8, data: comment.data, childNodes: [] };
}

function hasCssRules(styleSheet: StyleSheet): styleSheet is CSSStyleSheet {
  return "cssRules" in styleSheet;
}

function virtualizeDocument(
  document: Document
): import("@siteimprove/alfa-dom").Document {
  return {
    nodeType: 9,
    childNodes: Array.from(document.childNodes).map(virtualizeNode),
    compatMode:
      document.compatMode === "CSS1Compat" ? "CSS1Compat" : "BackCompat",
    styleSheets: Array.from(document.styleSheets)
      .filter(hasCssRules)
      .map(virtualizeStyleSheet)
  };
}

function virtualizeDocumentType(
  documentType: DocumentType
): import("@siteimprove/alfa-dom").DocumentType {
  return { nodeType: 10, name: documentType.name, childNodes: [] };
}

function virtualizeDocumentFragment(
  documentFragment: DocumentFragment
): import("@siteimprove/alfa-dom").DocumentFragment {
  return {
    nodeType: 11,
    childNodes: Array.from(documentFragment.childNodes).map(virtualizeNode)
  };
}

function virtualizeShadowRoot(
  shadowRoot: ShadowRoot,
  host: import("@siteimprove/alfa-dom").Element
): import("@siteimprove/alfa-dom").ShadowRoot {
  return {
    nodeType: 11,
    childNodes: Array.from(shadowRoot.childNodes).map(virtualizeNode),
    // We can only ever access open shadow roots, so the `mode` will always be
    // "open". If it were "closed", we would have never gotten this far.
    mode: "open"
  };
}

function virtualizeStyleSheet(
  styleSheet: CSSStyleSheet
): import("@siteimprove/alfa-dom").StyleSheet {
  return {
    cssRules: Array.from(styleSheet.cssRules).map(virtualizeRule)
  };
}

function virtualizeStyleDeclaration(
  styleDeclaration: CSSStyleDeclaration
): import("@siteimprove/alfa-dom").StyleDeclaration {
  return {
    cssText: styleDeclaration.cssText
  };
}

function virtualizeRule(rule: CSSRule): import("@siteimprove/alfa-dom").Rule {
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

function virtualizeStyleRule(
  styleRule: CSSStyleRule
): import("@siteimprove/alfa-dom").StyleRule {
  return {
    type: 1,
    selectorText: styleRule.selectorText,
    style: virtualizeStyleDeclaration(styleRule.style)
  };
}

function virtualizeImportRule(
  importRule: CSSImportRule
): import("@siteimprove/alfa-dom").ImportRule {
  return {
    type: 3,
    href: importRule.href,
    media: Array.from(importRule.media),
    styleSheet: virtualizeStyleSheet(importRule.styleSheet)
  };
}

function virtualizeMediaRule(
  mediaRule: CSSMediaRule
): import("@siteimprove/alfa-dom").MediaRule {
  return {
    type: 4,
    cssRules: Array.from(mediaRule.cssRules).map(virtualizeRule),
    media: Array.from(mediaRule.media)
  };
}

function virtualizeFontFaceRule(
  fontFaceRule: CSSFontFaceRule
): import("@siteimprove/alfa-dom").FontFaceRule {
  return {
    type: 5,
    style: virtualizeStyleDeclaration(fontFaceRule.style)
  };
}

function virtualizePageRule(
  pageRule: CSSPageRule
): import("@siteimprove/alfa-dom").PageRule {
  return {
    type: 6,
    selectorText: pageRule.selectorText,
    style: virtualizeStyleDeclaration(pageRule.style)
  };
}

function virtualizeKeyframesRule(
  keyframesRule: CSSKeyframesRule
): import("@siteimprove/alfa-dom").KeyframesRule {
  return {
    type: 7,
    name: keyframesRule.name,
    cssRules: Array.from(keyframesRule.cssRules).map(virtualizeRule)
  };
}

function virtualizeKeyframeRule(
  keyframeRule: CSSKeyframeRule
): import("@siteimprove/alfa-dom").KeyframeRule {
  return {
    type: 8,
    keyText: keyframeRule.keyText,
    style: virtualizeStyleDeclaration(keyframeRule.style)
  };
}

function virtualizeNamespaceRule(
  namespaceRule: CSSNamespaceRule
): import("@siteimprove/alfa-dom").NamespaceRule {
  return {
    type: 10,
    namespaceURI: namespaceRule.namespaceURI,
    prefix: namespaceRule.prefix
  };
}

function virtualizeSupportsRule(
  supportsRule: CSSSupportsRule
): import("@siteimprove/alfa-dom").SupportsRule {
  return {
    type: 12,
    cssRules: Array.from(supportsRule.cssRules).map(virtualizeRule),
    conditionText: supportsRule.conditionText
  };
}
