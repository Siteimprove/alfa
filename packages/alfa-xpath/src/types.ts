import { Descriptor, Descriptors } from "./descriptors";

export const enum ExpressionType {
  StringLiteral,
  IntegerLiteral,
  DecimalLiteral,
  DoubleLiteral,
  FunctionCall,
  Path,
  Filter,
  Axis
}

export interface Expression<T extends ExpressionType = ExpressionType> {
  readonly type: T;
}

export type PrimaryExpression = FunctionCallExpression;

export type LiteralExpression =
  | StringLiteralExpression
  | IntegerLiteralExpression
  | DecimalLiteralExpression
  | DoubleLiteralExpression;

export interface StringLiteralExpression
  extends Expression<ExpressionType.StringLiteral> {
  readonly value: string;
}

export interface IntegerLiteralExpression
  extends Expression<ExpressionType.IntegerLiteral> {
  readonly value: number;
}

export interface DecimalLiteralExpression
  extends Expression<ExpressionType.DecimalLiteral> {
  readonly value: number;
}

export interface DoubleLiteralExpression
  extends Expression<ExpressionType.DoubleLiteral> {
  readonly value: number;
}

export interface FunctionCallExpression
  extends Expression<ExpressionType.FunctionCall> {
  readonly prefix: string | null;
  readonly name: string;
  readonly arity: number;
  readonly parameters: Iterable<Expression>;
}

export interface PathExpression extends Expression<ExpressionType.Path> {
  readonly left: StepExpression | PathExpression;
  readonly right: StepExpression;
}

export type StepExpression = PostfixExpression | AxisExpression;

export type PostfixExpression = PrimaryExpression | FilterExpression;

export interface FilterExpression extends Expression<ExpressionType.Filter> {
  readonly expression: PrimaryExpression;
  readonly predicate: Expression;
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
  readonly axis: Axis;
  readonly test: NodeTest | null;
  readonly predicates: Iterable<Expression>;
}

export type NodeTest = KindTest | NameTest;

export interface KindTest {
  readonly kind: number;
}

export interface NameTest {
  readonly prefix?: string;
  readonly name: string;
}

export interface Item<V extends Item.Value = Item.Value> {
  readonly type: Descriptor.For<V, Item.Type>;
  readonly value: V;
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

  export type TypeFor<V extends Value = Value> = Descriptor.For<V, Type>;
}

export interface Sequence<V extends Sequence.Value = Sequence.Value> {
  readonly type: Descriptor.For<V, Sequence.Type>;
  readonly value: V;
}

export namespace Sequence {
  export type Type =
    | Descriptors.Sequence<Item.Type>
    | Descriptors.Optional<Item.Type>;

  export type Value<T extends Type = Type> = Descriptor.Value<T>;

  export type TypeFor<V extends Value = Value> = Descriptor.For<V, Type>;
}

export type Type = Item.Type | Sequence.Type;

export type Value<T extends Type = Type> = T extends Item.Type
  ? Item.Value<T>
  : T extends Sequence.Type
  ? Sequence.Value<T>
  : never;

export type TypeFor<V extends Value> = V extends Item.Value
  ? Item.TypeFor<V>
  : Sequence.TypeFor<V>;
