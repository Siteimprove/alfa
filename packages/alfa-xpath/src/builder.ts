import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Expression } from "./expression";

export class Builder<T extends Expression = Expression>
  implements Equatable, Serializable {
  protected readonly _expression: T;

  public constructor(expression: T) {
    this._expression = expression;
  }

  public get expression(): T {
    return this._expression;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Builder && value._expression.equals(this._expression)
    );
  }

  public toJSON(): Builder.JSON {
    return {
      expression: this._expression.toJSON(),
    };
  }

  public toString(): string {
    return `${this._expression}`;
  }
}

export namespace Builder {
  export interface JSON {
    [key: string]: json.JSON;
    expression: Expression.JSON;
  }

  function PathOperand<T extends Expression.Step | Expression.Path>(
    Base: new (expression: T) => Builder<T>
  ) {
    return class PathOperand extends Base {
      public child(name?: string): Path {
        return step(this, axis.child(name));
      }

      public parent(name?: string): Path {
        return step(this, axis.parent(name));
      }

      public descendant(name?: string): Path {
        return step(this, axis.descendant(name));
      }

      public ancestor(name?: string): Path {
        return step(this, axis.ancestor(name));
      }

      public attribute(name?: string): Path {
        return step(this, axis.attribute(name));
      }
    };
  }

  export class ContextItem extends PathOperand<Expression.ContextItem>(
    Builder
  ) {
    public where(predicate: Builder): Filter {
      return new Filter(
        Expression.Filter.of(this.expression, [predicate.expression])
      );
    }
  }

  export class Filter extends PathOperand<Expression.Filter>(Builder) {
    public where(predicate: Builder): Filter {
      return new Filter(
        Expression.Filter.of(this.expression.base, [
          ...this.expression.predicates,
          predicate.expression,
        ])
      );
    }
  }

  export class Axis extends PathOperand<Expression.Axis>(Builder) {
    public where(predicate: Builder): Axis {
      return new Axis(
        Expression.Axis.of(this.expression.axis, this.expression.test, [
          ...this.expression.predicates,
          predicate.expression,
        ])
      );
    }
  }

  export class Path extends PathOperand<Expression.Path>(Builder) {
    public where(predicate: Builder): Path {
      if (
        this.expression.right.type === "filter" ||
        this.expression.right.type === "axis"
      ) {
        return new Path(
          Expression.Path.of(
            this.expression.left,
            Expression.Filter.of(this.expression.right, [
              ...this.expression.right.predicates,
              predicate.expression,
            ])
          )
        );
      }

      return new Path(
        Expression.Path.of(
          this.expression.left,
          Expression.Filter.of(this.expression.right, [predicate.expression])
        )
      );
    }
  }
}

export function context(): Builder.ContextItem {
  return new Builder.ContextItem(Expression.ContextItem.of());
}

export function axis(axis: Expression.Axis.Type, name?: string): Builder.Axis {
  return new Builder.Axis(
    Expression.Axis.of(
      axis,
      name === undefined
        ? None
        : Option.of(Expression.Test.Name.of(None, name)),
      []
    )
  );
}

export namespace axis {
  export function self(name?: string): Builder.Axis {
    return axis("self", name);
  }

  export function child(name?: string): Builder.Axis {
    return axis("child", name);
  }

  export function parent(name?: string): Builder.Axis {
    return axis("parent", name);
  }

  export function descendant(name?: string): Builder.Axis {
    return axis("descendant", name);
  }

  export function ancestor(name?: string): Builder.Axis {
    return axis("ancestor", name);
  }

  export function attribute(name?: string): Builder.Axis {
    return axis("attribute", name);
  }
}

export function step(
  left: Builder<Expression.Step | Expression.Path>,
  right: Builder<Expression.Step>
): Builder.Path {
  return new Builder.Path(
    Expression.Path.of(left.expression, right.expression)
  );
}

export function nth(i: number): Builder<Expression.Integer> {
  return new Builder(Expression.Integer.of(i));
}
