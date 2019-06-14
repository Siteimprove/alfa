import * as g from "./guards";
import * as t from "./types";

export function clone<T extends t.Node>(node: T): T {
  return cloneNode(node) as T;
}

function cloneNode(node: t.Node): t.Node {
  if (g.isElement(node)) {
    return cloneElement(node);
  }

  if (g.isAttribute(node)) {
    return cloneAttribute(node);
  }

  if (g.isText(node)) {
    return cloneText(node);
  }

  if (g.isComment(node)) {
    return cloneComment(node);
  }

  if (g.isDocument(node)) {
    return cloneDocument(node);
  }

  if (g.isDocumentType(node)) {
    return cloneDocumentType(node);
  }

  if (g.isDocumentFragment(node)) {
    return cloneDocumentFragment(node);
  }

  throw new Error(`Cannot clone node of type ${node.nodeType}`);
}

function cloneElement(element: t.Element): t.Element {
  const { prefix, localName = null, shadowRoot = null } = element;

  const attributes = Array.from(element.attributes).map(cloneAttribute);

  const childNodes = Array.from(element.childNodes).map(cloneNode);

  return {
    nodeType: 1,
    prefix,
    localName: localName === null ? "" : localName,
    attributes,
    childNodes,
    shadowRoot: shadowRoot === null ? null : cloneShadowRoot(shadowRoot)
  };
}

function cloneAttribute(attribute: t.Attribute): t.Attribute {
  const { prefix, localName = null, value } = attribute;

  return {
    nodeType: 2,
    prefix,
    localName: localName === null ? "" : localName,
    value,
    childNodes: []
  };
}

function cloneText(text: t.Text): t.Text {
  return { nodeType: 3, data: text.data, childNodes: [] };
}

function cloneComment(comment: t.Comment): t.Comment {
  return { nodeType: 8, data: comment.data, childNodes: [] };
}

function cloneDocument(document: t.Document): t.Document {
  const { compatMode } = document;

  const childNodes = Array.from(document.childNodes).map(cloneNode);

  const styleSheets = Array.from(document.styleSheets).map(cloneStyleSheet);

  return {
    nodeType: 9,
    childNodes,
    compatMode,
    styleSheets
  };
}

function cloneDocumentType(documentType: t.DocumentType): t.DocumentType {
  const { name, publicId, systemId } = documentType;

  return {
    nodeType: 10,
    name,
    publicId,
    systemId,
    childNodes: []
  };
}

function cloneDocumentFragment(
  documentFragment: t.DocumentFragment
): t.DocumentFragment {
  const childNodes = Array.from(documentFragment.childNodes).map(cloneNode);

  return {
    nodeType: 11,
    childNodes
  };
}

function cloneShadowRoot(shadowRoot: t.ShadowRoot): t.ShadowRoot {
  const { mode } = shadowRoot;

  const childNodes = Array.from(shadowRoot.childNodes).map(cloneNode);

  return {
    nodeType: 11,
    childNodes,
    mode
  };
}

function cloneStyleSheet(styleSheet: t.StyleSheet): t.StyleSheet {
  const { disabled } = styleSheet;

  const cssRules = Array.from(styleSheet.cssRules).map(cloneRule);

  return {
    disabled,
    cssRules
  };
}

function cloneStyleDeclaration(
  styleDeclaration: t.StyleDeclaration
): t.StyleDeclaration {
  const { cssText } = styleDeclaration;

  return {
    cssText
  };
}

function cloneRule(rule: t.Rule): t.Rule {
  if (g.isStyleRule(rule)) {
    return cloneStyleRule(rule);
  }

  if (g.isImportRule(rule)) {
    return cloneImportRule(rule);
  }

  if (g.isMediaRule(rule)) {
    return cloneMediaRule(rule);
  }

  if (g.isFontFaceRule(rule)) {
    return cloneFontFaceRule(rule);
  }

  if (g.isPageRule(rule)) {
    return clonePageRule(rule);
  }

  if (g.isKeyframesRule(rule)) {
    return cloneKeyframesRule(rule);
  }

  if (g.isKeyframeRule(rule)) {
    return cloneKeyframeRule(rule);
  }

  if (g.isNamespaceRule(rule)) {
    return cloneNamespaceRule(rule);
  }

  if (g.isSupportsRule(rule)) {
    return cloneSupportsRule(rule);
  }

  throw new Error(`Cannot clone rule of type ${rule.type}`);
}

function cloneStyleRule(styleRule: t.StyleRule): t.StyleRule {
  const { selectorText, style } = styleRule;

  return {
    type: 1,
    selectorText,
    style: cloneStyleDeclaration(style)
  };
}

function cloneImportRule(importRule: t.ImportRule): t.ImportRule {
  const { href, styleSheet } = importRule;

  const media = Array.from(importRule.media);

  return {
    type: 3,
    href,
    media,
    styleSheet: cloneStyleSheet(styleSheet)
  };
}

function cloneMediaRule(mediaRule: t.MediaRule): t.MediaRule {
  const { conditionText } = mediaRule;

  const cssRules = Array.from(mediaRule.cssRules).map(cloneRule);

  return {
    type: 4,
    cssRules,
    conditionText
  };
}

function cloneFontFaceRule(fontFaceRule: t.FontFaceRule): t.FontFaceRule {
  const { style } = fontFaceRule;

  return {
    type: 5,
    style: cloneStyleDeclaration(style)
  };
}

function clonePageRule(pageRule: t.PageRule): t.PageRule {
  const { selectorText, style } = pageRule;

  return {
    type: 6,
    selectorText,
    style: cloneStyleDeclaration(style)
  };
}

function cloneKeyframesRule(keyframesRule: t.KeyframesRule): t.KeyframesRule {
  const { name } = keyframesRule;

  const cssRules = Array.from(keyframesRule.cssRules).map(cloneRule);

  return {
    type: 7,
    name,
    cssRules
  };
}

function cloneKeyframeRule(keyframeRule: t.KeyframeRule): t.KeyframeRule {
  const { keyText, style } = keyframeRule;

  return {
    type: 8,
    keyText,
    style: cloneStyleDeclaration(style)
  };
}

function cloneNamespaceRule(namespaceRule: t.NamespaceRule): t.NamespaceRule {
  const { namespaceURI, prefix } = namespaceRule;

  return {
    type: 10,
    namespaceURI,
    prefix
  };
}

function cloneSupportsRule(supportsRule: t.SupportsRule): t.SupportsRule {
  const { conditionText } = supportsRule;

  const cssRules = Array.from(supportsRule.cssRules).map(cloneRule);

  return {
    type: 12,
    cssRules,
    conditionText
  };
}
