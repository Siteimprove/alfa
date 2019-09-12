/// <reference lib="dom" />

// As this file, or more precisely the JavaScript resulting from this file, is
// evaluated verbatim inside a browser context, it must be kept entirely self-
// contained and not rely on other modules. To accomplish this, the code below
// has neither exports nor imports, which signals to the TypeScript compiler
// that the file is not a module. As we still need to refer to types from the
// @siteimprove/alfa-dom package, these types are referenced using the special
// `import` types, which works for global scripts as well as modules.

function virtualizeNode(node: Node): import("@siteimprove/alfa-dom").Node {
  switch (node.nodeType) {
    case node.ELEMENT_NODE:
      return virtualizeElement(node as Element);

    case node.ATTRIBUTE_NODE:
      return virtualizeAttribute(node as Attr);

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
  const { prefix, localName, shadowRoot } = element;

  const attributes = Array.from(element.attributes).map(virtualizeAttribute);

  const childNodes = Array.from(element.childNodes).map(virtualizeNode);

  let contentDocument: Document | null | undefined;

  if (
    element instanceof HTMLIFrameElement ||
    element instanceof HTMLObjectElement
  ) {
    contentDocument = element.contentDocument;
  }

  return {
    nodeType: 1,
    prefix,
    localName: localName === null ? "" : localName,
    attributes,
    shadowRoot: shadowRoot === null ? null : virtualizeShadowRoot(shadowRoot),
    childNodes,
    ...(contentDocument === undefined
      ? null
      : {
          contentDocument:
            contentDocument === null
              ? null
              : virtualizeDocument(contentDocument)
        })
  };
}

function virtualizeAttribute(
  attribute: Attr
): import("@siteimprove/alfa-dom").Attribute {
  const { prefix, localName, value } = attribute;

  return {
    nodeType: 2,
    prefix,
    localName: localName === null ? "" : localName,
    value,
    childNodes: []
  };
}

function virtualizeText(text: Text): import("@siteimprove/alfa-dom").Text {
  const { data } = text;

  return {
    nodeType: 3,
    data,
    childNodes: []
  };
}

function virtualizeComment(
  comment: Comment
): import("@siteimprove/alfa-dom").Comment {
  const { data } = comment;

  return {
    nodeType: 8,
    data,
    childNodes: []
  };
}

function virtualizeDocument(
  document: Document
): import("@siteimprove/alfa-dom").Document {
  const childNodes = Array.from(document.childNodes).map(virtualizeNode);

  const styleSheets = Array.from(document.styleSheets).map(
    virtualizeStyleSheet
  );

  return {
    nodeType: 9,
    childNodes,
    styleSheets
  };
}

function virtualizeDocumentType(
  documentType: DocumentType
): import("@siteimprove/alfa-dom").DocumentType {
  const { name, publicId, systemId } = documentType;

  return {
    nodeType: 10,
    name,
    publicId,
    systemId,
    childNodes: []
  };
}

function virtualizeDocumentFragment(
  documentFragment: DocumentFragment
): import("@siteimprove/alfa-dom").DocumentFragment {
  const childNodes = Array.from(documentFragment.childNodes).map(
    virtualizeNode
  );

  return {
    nodeType: 11,
    childNodes
  };
}

function virtualizeShadowRoot(
  shadowRoot: ShadowRoot
): import("@siteimprove/alfa-dom").ShadowRoot {
  const { mode } = shadowRoot;

  const childNodes = Array.from(shadowRoot.childNodes).map(virtualizeNode);

  const styleSheets = Array.from(shadowRoot.styleSheets).map(
    virtualizeStyleSheet
  );

  return {
    nodeType: 11,
    childNodes,
    mode,
    styleSheets
  };
}

function virtualizeStyleSheet(
  styleSheet: StyleSheet | CSSStyleSheet
): import("@siteimprove/alfa-dom").StyleSheet {
  const { disabled } = styleSheet;

  const cssRules =
    "cssRules" in styleSheet
      ? Array.from(styleSheet.cssRules).map(virtualizeRule)
      : [];

  return {
    disabled,
    cssRules
  };
}

function virtualizeStyleDeclaration(
  styleDeclaration: CSSStyleDeclaration
): import("@siteimprove/alfa-dom").StyleDeclaration {
  const { cssText } = styleDeclaration;

  return {
    cssText
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
  const { selectorText, style } = styleRule;

  return {
    type: 1,
    selectorText,
    style: virtualizeStyleDeclaration(style)
  };
}

function virtualizeImportRule(
  importRule: CSSImportRule
): import("@siteimprove/alfa-dom").ImportRule {
  const { href, styleSheet } = importRule;

  const media = Array.from(importRule.media);

  return {
    type: 3,
    href,
    media,
    styleSheet: virtualizeStyleSheet(styleSheet)
  };
}

function virtualizeMediaRule(
  mediaRule: CSSMediaRule
): import("@siteimprove/alfa-dom").MediaRule {
  const { conditionText } = mediaRule;

  const cssRules = Array.from(mediaRule.cssRules).map(virtualizeRule);

  return {
    type: 4,
    cssRules,
    conditionText
  };
}

function virtualizeFontFaceRule(
  fontFaceRule: CSSFontFaceRule
): import("@siteimprove/alfa-dom").FontFaceRule {
  const { style } = fontFaceRule;

  return {
    type: 5,
    style: virtualizeStyleDeclaration(style)
  };
}

function virtualizePageRule(
  pageRule: CSSPageRule
): import("@siteimprove/alfa-dom").PageRule {
  const { selectorText, style } = pageRule;

  return {
    type: 6,
    selectorText,
    style: virtualizeStyleDeclaration(style)
  };
}

function virtualizeKeyframesRule(
  keyframesRule: CSSKeyframesRule
): import("@siteimprove/alfa-dom").KeyframesRule {
  const { name } = keyframesRule;

  const cssRules = Array.from(keyframesRule.cssRules).map(virtualizeRule);

  return {
    type: 7,
    name,
    cssRules
  };
}

function virtualizeKeyframeRule(
  keyframeRule: CSSKeyframeRule
): import("@siteimprove/alfa-dom").KeyframeRule {
  const { keyText, style } = keyframeRule;

  return {
    type: 8,
    keyText,
    style: virtualizeStyleDeclaration(style)
  };
}

function virtualizeNamespaceRule(
  namespaceRule: CSSNamespaceRule
): import("@siteimprove/alfa-dom").NamespaceRule {
  const { namespaceURI, prefix } = namespaceRule;

  return {
    type: 10,
    namespaceURI,
    prefix
  };
}

function virtualizeSupportsRule(
  supportsRule: CSSSupportsRule
): import("@siteimprove/alfa-dom").SupportsRule {
  const { conditionText } = supportsRule;

  const cssRules = Array.from(supportsRule.cssRules).map(virtualizeRule);

  return {
    type: 12,
    cssRules,
    conditionText
  };
}
