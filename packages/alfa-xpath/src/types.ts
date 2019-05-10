import { Tree } from "./tree";

export type Value = Tree;

export const enum ExpressionType {
  FunctionCall,
  Path,
  Filter,
  Axis
}

export interface Expression<T extends ExpressionType = ExpressionType> {
  readonly type: T;
}

export type PrimaryExpression = FunctionCallExpression;

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
  readonly test?: NodeTest;
  readonly predicates?: Iterable<Expression>;
}

export type NodeTest = KindTest | NameTest;

export interface KindTest {
  readonly kind: number;
}

export interface NameTest {
  readonly prefix?: string;
  readonly name: string;
}
