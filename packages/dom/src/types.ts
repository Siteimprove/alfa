/**
 * @see https://www.w3.org/TR/dom/#interface-node
 */
export interface Node {
  readonly nodeType: number;
  readonly childNodes: ArrayLike<Node>;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-parentnode
 */
export interface ParentNode extends Node {}

/**
 * @see https://www.w3.org/TR/dom/#interface-childnode
 */
export interface ChildNode extends Node {}

/**
 * @see https://www.w3.org/TR/dom/#interface-attr
 */
export interface Attribute {
  readonly name: string;
  readonly value: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-element
 */
export interface Element extends Node, ParentNode, ChildNode {
  readonly nodeType: 1;
  readonly namespaceURI: string | null;
  readonly tagName: string;
  readonly attributes: ArrayLike<Attribute>;

  /**
   * @see https://www.w3.org/TR/dom41/#dom-element-shadowroot
   */
  readonly shadowRoot: ShadowRoot | null;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-text
 */
export interface Text extends Node, ChildNode {
  readonly nodeType: 3;
  readonly data: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-comment
 */
export interface Comment extends Node, ChildNode {
  readonly nodeType: 8;
  readonly data: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-document
 */
export interface Document extends Node, ParentNode {
  readonly nodeType: 9;

  /**
   * @see https://www.w3.org/TR/cssom/#extensions-to-the-document-interface
   */
  readonly styleSheets: ArrayLike<StyleSheet>;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-documenttype
 */
export interface DocumentType extends Node, ChildNode {
  readonly nodeType: 10;
  readonly name: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-documentfragment
 */
export interface DocumentFragment extends Node, ParentNode {
  readonly nodeType: 11;
}

/**
 * @see https://www.w3.org/TR/dom41/#interface-shadowroot
 */
export interface ShadowRoot extends DocumentFragment {}

/**
 * @see https://www.w3.org/TR/cssom/#cssstylesheet
 */
export interface StyleSheet {
  readonly cssRules: ArrayLike<Rule>;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssstyledeclaration
 */
export interface StyleDeclaration {
  readonly cssText: string;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssrule
 */
export interface Rule {
  readonly type: number;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssgroupingrule
 */
export interface GroupingRule extends Rule {
  readonly cssRules: ArrayLike<Rule>;
}

/**
 * @see https://www.w3.org/TR/css-conditional/#cssconditionrule
 */
export interface ConditionRule extends GroupingRule {
  readonly conditionText: string;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssstylerule
 */
export interface StyleRule extends Rule {
  readonly type: 1;
  readonly selectorText: string;
  readonly style: StyleDeclaration;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssimportrule
 */
export interface ImportRule extends Rule {
  readonly type: 3;
  readonly href: string;
  readonly media: ArrayLike<string>;
  readonly styleSheet: StyleSheet;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssmediarule
 */
export interface MediaRule extends GroupingRule {
  readonly type: 4;
  readonly media: ArrayLike<string>;
}

export interface FontFaceRule extends Rule {
  readonly type: 5;
  readonly style: StyleDeclaration;
}

/**
 * NB: While the specification states that the `CSSPageRule` interface extends
 * `CSSGroupingRule`, this is in practice not the case; in current browser
 * implementations, it extends `CSSRule`.
 *
 * @see https://www.w3.org/TR/cssom/#csspagerule
 */
export interface PageRule extends Rule {
  readonly type: 6;
  readonly selectorText: string;
  readonly style: StyleDeclaration;
}

/**
 * @see https://www.w3.org/TR/css-animations/#csskeyframesrule
 */
export interface KeyframesRule extends Rule {
  readonly type: 7;
  readonly name: string;
  readonly cssRules: ArrayLike<Rule>;
}

/**
 * @see https://www.w3.org/TR/css-animations/#csskeyframerule
 */
export interface KeyframeRule extends Rule {
  readonly type: 8;
  readonly keyText: string;
  readonly style: StyleDeclaration;
}

/**
 * @see https://www.w3.org/TR/cssom/#cssnamespacerule
 */
export interface NamespaceRule extends Rule {
  readonly type: 10;
  readonly namespaceURI: string;
  readonly prefix: string;
}

/**
 * @see https://www.w3.org/TR/css-conditional/#csssupportsrule
 */
export interface SupportsRule extends ConditionRule {
  readonly type: 12;
}
