import * as g from "./guards";
import { serialize } from "./serialize";
import * as t from "./types";
import { Expression, ExpressionType } from "./types";

export class ExpressionBuilder<T extends Expression = Expression> {
  public readonly expression: T;

  public constructor(expression: T) {
    this.expression = expression;
  }

  public toString(): string {
    return serialize(this.expression);
  }
}

function PathOperand<T extends t.StepExpression | t.PathExpression>(
  Base: new (...args: Array<any>) => ExpressionBuilder<T> // tslint:disable-line:no-any
) {
  return class PathOperand extends Base {
    public child(name?: string): PathExpressionBuilder {
      return step(this, axis.child(name));
    }

    public descendant(name?: string): PathExpressionBuilder {
      return step(this, axis.descendant(name));
    }

    public attribute(name?: string): PathExpressionBuilder {
      return step(this, axis.attribute(name));
    }
  };
}

export class ContextItemExpressionBuilder extends PathOperand<
  t.ContextItemExpression
>(ExpressionBuilder) {
  public where(predicate: ExpressionBuilder): FilterExpressionBuilder {
    return new FilterExpressionBuilder({
      type: ExpressionType.Filter,
      base: this.expression,
      predicates: [predicate.expression]
    });
  }
}

export class FilterExpressionBuilder extends PathOperand<t.FilterExpression>(
  ExpressionBuilder
) {
  public where(predicate: ExpressionBuilder): FilterExpressionBuilder {
    return new FilterExpressionBuilder({
      ...this.expression,
      predicates: [...this.expression.predicates, predicate.expression]
    });
  }
}

export class AxisExpressionBuilder extends PathOperand<t.AxisExpression>(
  ExpressionBuilder
) {
  public where(predicate: ExpressionBuilder): AxisExpressionBuilder {
    return new AxisExpressionBuilder({
      ...this.expression,
      predicates: [...this.expression.predicates, predicate.expression]
    });
  }
}

export class PathExpressionBuilder extends PathOperand<t.PathExpression>(
  ExpressionBuilder
) {
  public where(predicate: ExpressionBuilder): PathExpressionBuilder {
    if (
      g.isFilterExpression(this.expression.right) ||
      g.isAxisExpression(this.expression.right)
    ) {
      return new PathExpressionBuilder({
        ...this.expression,
        right: {
          ...this.expression.right,
          predicates: [
            ...this.expression.right.predicates,
            predicate.expression
          ]
        }
      });
    }

    return new PathExpressionBuilder({
      ...this.expression,
      right: {
        type: ExpressionType.Filter,
        base: this.expression.right,
        predicates: [predicate.expression]
      }
    });
  }
}

export function context(): ContextItemExpressionBuilder {
  return new ContextItemExpressionBuilder({
    type: ExpressionType.ContextItem
  });
}

export function axis(axis: t.Axis, name?: string): AxisExpressionBuilder {
  return new AxisExpressionBuilder({
    type: ExpressionType.Axis,
    axis,
    test: name === undefined ? null : { name },
    predicates: []
  });
}

export namespace axis {
  export function self(name?: string): AxisExpressionBuilder {
    return axis("self", name);
  }

  export function child(name?: string): AxisExpressionBuilder {
    return axis("child", name);
  }

  export function descendant(name?: string): AxisExpressionBuilder {
    return axis("descendant", name);
  }

  export function attribute(name?: string): AxisExpressionBuilder {
    return axis("attribute", name);
  }
}

export function step(
  left: ExpressionBuilder<t.StepExpression | t.PathExpression>,
  right: ExpressionBuilder<t.StepExpression>
): PathExpressionBuilder {
  return new PathExpressionBuilder({
    type: ExpressionType.Path,
    left: left.expression,
    right: right.expression
  });
}

export function nth(i: number): ExpressionBuilder<t.IntegerLiteralExpression> {
  return new ExpressionBuilder({
    type: ExpressionType.IntegerLiteral,
    value: i
  });
}
