import {
  Attribute,
  Comment,
  ConditionRule,
  Document,
  DocumentFragment,
  DocumentType,
  Element,
  FontFaceRule,
  GroupingRule,
  ImportRule,
  KeyframeRule,
  KeyframesRule,
  MediaRule,
  NamespaceRule,
  Node,
  NodeType,
  PageRule,
  Rule,
  RuleType,
  ShadowRoot,
  StyleRule,
  SupportsRule,
  Text
} from "./types";

export function isElement(node: Node): node is Element {
  return node.nodeType === NodeType.Element;
}

export function isAttribute(node: Node): node is Attribute {
  return node.nodeType === NodeType.Attribute;
}

export function isText(node: Node): node is Text {
  return node.nodeType === NodeType.Text;
}

export function isComment(node: Node): node is Comment {
  return node.nodeType === NodeType.Comment;
}

export function isDocument(node: Node): node is Document {
  return node.nodeType === NodeType.Document;
}

export function isDocumentType(node: Node): node is DocumentType {
  return node.nodeType === NodeType.DocumentType;
}

export function isDocumentFragment(node: Node): node is DocumentFragment {
  return node.nodeType === NodeType.DocumentFragment;
}

export function isShadowRoot(node: Node): node is ShadowRoot {
  return isDocumentFragment(node) && "mode" in node;
}

export function isGroupingRule(rule: Rule): rule is GroupingRule {
  return isConditionRule(rule);
}

export function isConditionRule(rule: Rule): rule is ConditionRule {
  return isMediaRule(rule) || isSupportsRule(rule);
}

export function isStyleRule(rule: Rule): rule is StyleRule {
  return rule.type === RuleType.Style;
}

export function isImportRule(rule: Rule): rule is ImportRule {
  return rule.type === RuleType.Import;
}

export function isMediaRule(rule: Rule): rule is MediaRule {
  return rule.type === RuleType.Media;
}

export function isFontFaceRule(rule: Rule): rule is FontFaceRule {
  return rule.type === RuleType.FontFace;
}

export function isPageRule(rule: Rule): rule is PageRule {
  return rule.type === RuleType.Page;
}

export function isKeyframesRule(rule: Rule): rule is KeyframesRule {
  return rule.type === RuleType.Keyframes;
}

export function isKeyframeRule(rule: Rule): rule is KeyframeRule {
  return rule.type === RuleType.Keyframe;
}

export function isNamespaceRule(rule: Rule): rule is NamespaceRule {
  return rule.type === RuleType.Namespace;
}

export function isSupportsRule(rule: Rule): rule is SupportsRule {
  return rule.type === RuleType.Supports;
}
