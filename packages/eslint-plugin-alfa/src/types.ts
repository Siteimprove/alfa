import { BaseNode, Expression, Literal } from "estree"; // tslint:disable-line

// https://github.com/facebook/jsx/blob/master/AST.md

/**
 * @internal
 */
export interface JSXElement extends BaseNode {
  readonly type: "JSXElement";
  readonly openingElement: JSXOpeningElement;
  readonly closingElement: JSXClosingElement | null;
  readonly children: ReadonlyArray<
    JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment
  >;
}

/**
 * @internal
 */
export interface JSXOpeningElement extends BaseNode {
  readonly type: "JSXOpeningElement";
  readonly name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
  readonly attributes: ReadonlyArray<JSXAttribute | JSXSpreadAttribute>;
  readonly selfClosing: boolean;
}

/**
 * @internal
 */
export interface JSXClosingElement extends BaseNode {
  readonly type: "JSXClosingElement";
  readonly name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
}

/**
 * @internal
 */
export interface JSXFragment extends BaseNode {
  readonly type: "JSXFragment";
  readonly openingElement: JSXOpeningFragment;
  readonly closingElement: JSXClosingFragment | null;
  readonly children: ReadonlyArray<
    JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment
  >;
}

/**
 * @internal
 */
export interface JSXOpeningFragment extends BaseNode {
  readonly type: "JSXOpeningFragment";
}

/**
 * @internal
 */
export interface JSXClosingFragment extends BaseNode {
  readonly type: "JSXClosingFragment";
}

/**
 * @internal
 */
export interface JSXAttribute extends BaseNode {
  readonly type: "JSXAttribute";
  readonly name: JSXIdentifier | JSXNamespacedName;
  readonly value:
    | JSXElement
    | JSXFragment
    | JSXExpressionContainer
    | Literal
    | null;
}

/**
 * @internal
 */
export interface JSXSpreadAttribute extends BaseNode {
  readonly type: "JSXSpreadAttribute";
  readonly expression: Expression;
}

/**
 * @internal
 */
export interface JSXSpreadChild extends BaseNode {
  readonly type: "JSXSpreadChild";
  readonly expression: Expression;
}

/**
 * @internal
 */
export interface JSXIdentifier extends BaseNode {
  readonly type: "JSXIdentifier";
  readonly name: string;
}

/**
 * @internal
 */
export interface JSXNamespacedName extends BaseNode {
  readonly type: "JSXNamespacedName";
  readonly namespace: JSXIdentifier;
  readonly name: JSXIdentifier;
}

/**
 * @internal
 */
export interface JSXExpressionContainer extends BaseNode {
  readonly type: "JSXExpressionContainer";
  readonly expression: Expression;
}

/**
 * @internal
 */
export interface JSXMemberExpression extends BaseNode {
  readonly type: "JSXMemberExpression";
  readonly object: JSXMemberExpression | JSXIdentifier;
  readonly property: JSXIdentifier;
}

/**
 * @internal
 */
export interface JSXText extends BaseNode {
  readonly type: "JSXText";
  readonly value: string;
}
