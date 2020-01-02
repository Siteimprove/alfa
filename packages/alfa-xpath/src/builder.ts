import { isAxisExpression, isFilterExpression } from "./guards";
import { serialize } from "./serialize";
import {
  Axis,
  AxisExpression,
  ContextItemExpression,
  FilterExpression,
  IntegerLiteralExpression,
  PathExpression,
  StepExpression
} from "./types";
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

function PathOperand<T extends StepExpression | PathExpression>(
  Base: new (...args: Array<any>) => ExpressionBuilder<T>
) {
  return class PathOperand extends Base {
    public child(name?: string): PathExpressionBuilder {
      return step(this, axis.child(name));
    }

    public parent(name?: string): PathExpressionBuilder {
      return step(this, axis.parent(name));
    }

    public descendant(name?: string): PathExpressionBuilder {
      return step(this, axis.descendant(name));
    }

    public ancestor(name?: string): PathExpressionBuilder {
      return step(this, axis.ancestor(name));
    }

    public attribute(name?: string): PathExpressionBuilder {
      return step(this, axis.attribute(name));
    }
  };
}

export class ContextItemExpressionBuilder extends PathOperand<
  ContextItemExpression
>(ExpressionBuilder) {
  public where(predicate: ExpressionBuilder): FilterExpressionBuilder {
    return new FilterExpressionBuilder({
      type: ExpressionType.Filter,
      base: this.expression,
      predicates: [predicate.expression]
    });
  }
}

export class FilterExpressionBuilder extends PathOperand<FilterExpression>(
  ExpressionBuilder
) {
  public where(predicate: ExpressionBuilder): FilterExpressionBuilder {
    return new FilterExpressionBuilder({
      ...this.expression,
      predicates: [...this.expression.predicates, predicate.expression]
    });
  }
}

export class AxisExpressionBuilder extends PathOperand<AxisExpression>(
  ExpressionBuilder
) {
  public where(predicate: ExpressionBuilder): AxisExpressionBuilder {
    return new AxisExpressionBuilder({
      ...this.expression,
      predicates: [...this.expression.predicates, predicate.expression]
    });
  }
}

export class PathExpressionBuilder extends PathOperand<PathExpression>(
  ExpressionBuilder
) {
  public where(predicate: ExpressionBuilder): PathExpressionBuilder {
    if (
      isFilterExpression(this.expression.right) ||
      isAxisExpression(this.expression.right)
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

export function axis(axis: Axis, name?: string): AxisExpressionBuilder {
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

  export function parent(name?: string): AxisExpressionBuilder {
    return axis("parent", name);
  }

  export function descendant(name?: string): AxisExpressionBuilder {
    return axis("descendant", name);
  }

  export function ancestor(name?: string): AxisExpressionBuilder {
    return axis("ancestor", name);
  }

  export function attribute(name?: string): AxisExpressionBuilder {
    return axis("attribute", name);
  }
}

export function step(
  left: ExpressionBuilder<StepExpression | PathExpression>,
  right: ExpressionBuilder<StepExpression>
): PathExpressionBuilder {
  return new PathExpressionBuilder({
    type: ExpressionType.Path,
    left: left.expression,
    right: right.expression
  });
}

export function nth(i: number): ExpressionBuilder<IntegerLiteralExpression> {
  return new ExpressionBuilder({
    type: ExpressionType.IntegerLiteral,
    value: i
  });
}
