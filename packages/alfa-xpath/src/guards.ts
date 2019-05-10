import * as t from "./types";
import { Expression, ExpressionType } from "./types";

export function isPrimaryExpression(
  expression: Expression
): expression is t.PrimaryExpression {
  return isFunctionCallExpression(expression);
}

export function isFunctionCallExpression(
  expression: Expression
): expression is t.PrimaryExpression {
  return expression.type === ExpressionType.FunctionCall;
}

export function isPathExpression(
  expression: Expression
): expression is t.PathExpression {
  return expression.type === ExpressionType.Path;
}

export function isStepExpression(
  expression: Expression
): expression is t.StepExpression {
  return isPostfixExpression(expression) || isAxisExpression(expression);
}

export function isPostfixExpression(
  expression: Expression
): expression is t.PostfixExpression {
  return isPrimaryExpression(expression) || isFilterExpression(expression);
}

export function isFilterExpression(
  expression: Expression
): expression is t.FilterExpression {
  return expression.type === ExpressionType.Filter;
}

export function isAxisExpression(
  expression: Expression
): expression is t.AxisExpression {
  return expression.type === ExpressionType.Axis;
}

export function isKindTest(test: t.NodeTest): test is t.KindTest {
  return "kind" in test;
}

export function isNameTest(test: t.NodeTest): test is t.NameTest {
  return "name" in test;
}
