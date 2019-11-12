import { Descriptor, Descriptors } from "./descriptors";

export const enum ExpressionType {
  StringLiteral,
  IntegerLiteral,
  DecimalLiteral,
  DoubleLiteral,
  ContextItem,
  FunctionCall,
  Path,
  Filter,
  Axis
}

export interface Expression<T extends ExpressionType = ExpressionType> {
  readonly type: T;
}

export type PrimaryExpression =
  | LiteralExpression
  | ContextItemExpression
  | FunctionCallExpression;

export type LiteralExpression =
  | StringLiteralExpression
  | IntegerLiteralExpression
  | DecimalLiteralExpression
  | DoubleLiteralExpression;

export interface StringLiteralExpression
  extends Expression<ExpressionType.StringLiteral> {
  value: string;
}

export interface IntegerLiteralExpression
  extends Expression<ExpressionType.IntegerLiteral> {
  value: number;
}

export interface DecimalLiteralExpression
  extends Expression<ExpressionType.DecimalLiteral> {
  value: number;
}

export interface DoubleLiteralExpression
  extends Expression<ExpressionType.DoubleLiteral> {
  value: number;
}

export interface ContextItemExpression
  extends Expression<ExpressionType.ContextItem> {}

export interface FunctionCallExpression
  extends Expression<ExpressionType.FunctionCall> {
  prefix: string | null;
  name: string;
  arity: number;
  parameters: Iterable<Expression>;
}

export interface PathExpression extends Expression<ExpressionType.Path> {
  left: StepExpression | PathExpression;
  right: StepExpression;
}

export type StepExpression = PostfixExpression | AxisExpression;

export type PostfixExpression = PrimaryExpression | FilterExpression;

export interface FilterExpression extends Expression<ExpressionType.Filter> {
  base: PrimaryExpression;
  predicates: Iterable<Expression>;
}

export type Axis =
  | "ancestor"
  | "ancestor-or-self"
  | "attribute"
  | "child"
  | "descendant"
  | "descendant-or-self"
  | "following"
  | "following-sibling"
  | "parent"
  | "preceding"
  | "preceding-sibling"
  | "self";

export interface AxisExpression extends Expression<ExpressionType.Axis> {
  axis: Axis;
  test: NodeTest | null;
  predicates: Iterable<Expression>;
}

export type NodeTest = KindTest | NameTest;

export type KindTest =
  | DocumentTest
  | ElementTest
  | AttributeTest
  | CommentTest
  | TextTest;

export interface DocumentTest {
  readonly kind: "document-node";
}

export interface ElementTest {
  readonly kind: "element";
  name: string | null;
}

export interface AttributeTest {
  readonly kind: "attribute";
  name: string | null;
}

export interface CommentTest {
  readonly kind: "comment";
}

export interface TextTest {
  readonly kind: "text";
}

export interface NameTest {
  prefix?: string;
  name: string;
}

export interface Item<V extends Item.Value = Item.Value> {
  readonly type: Descriptor.For<V, Item.Type>;
  value: V;
}

export namespace Item {
  export type Type =
    | Descriptors.String
    | Descriptors.Numeric
    | Descriptors.Integer
    | Descriptors.Decimal
    | Descriptors.Double
    | Descriptors.Boolean
    | Descriptors.Node
    | Descriptors.Element;

  export type Value<T extends Type = Type> = Descriptor.Value<T>;

  export type TypeFor<V extends Value> = Descriptor.For<V, Type>;

  export type Sequence<T extends Type = Type> = Descriptors.Sequence<T>;

  export type Optional<T extends Type = Type> = Descriptors.Optional<T>;
}

export type Type =
  | Item.Type
  | Item.Sequence<Item.Type>
  | Item.Optional<Item.Type>;

export type Value<T extends Type = Type> = Descriptor.Value<T>;

export type TypeFor<V extends Value> = Descriptor.For<V, Type>;
