import { Node } from "@siteimprove/alfa-dom";
import { Tree } from "./tree";

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

type Property<T, V> = { [P in keyof T]: T[P] extends V ? P : never }[keyof T];

export interface Item<T extends Item.Value = Item.Value> {
  readonly type: Item.Type.Name<T>;
  readonly value: T;
}

export namespace Item {
  export type Value = Type[keyof Type];

  export interface Type {
    "node()": Tree<Node>;
  }

  export namespace Type {
    export type Name<T> = Property<Type, T>;
  }

  export function matches<T extends keyof Type>(
    item: Item,
    type: T
  ): item is Item<Type[T]> {
    return true;
  }
}

export interface Sequence<T extends Sequence.Value = Sequence.Value> {
  readonly type: Sequence.Type.Name<T>;
  readonly value: T;
}

export namespace Sequence {
  export type Value = Type[keyof Type];

  export interface Type extends Item.Type {
    "node()*": Iterable<Tree<Node>>;
    "node()?": Tree<Node> | undefined;
  }

  export namespace Type {
    export type Name<T> = Property<Type, T>;
  }

  export function itemType(type: keyof Type): keyof Item.Type {
    switch (type) {
      case "node()*":
      case "node()?":
        return "node()";
    }

    return type;
  }
}
