import {
  AxisExpression,
  ContextItemExpression,
  FilterExpression,
  FunctionCallExpression,
  IntegerLiteralExpression,
  KindTest,
  LiteralExpression,
  NameTest,
  NodeTest,
  PathExpression,
  PostfixExpression,
  PrimaryExpression,
  StepExpression
} from "./types";
import { Expression, ExpressionType } from "./types";

export function isPrimaryExpression(
  expression: Expression
): expression is PrimaryExpression {
  return (
    isLiteralExpression(expression) ||
    isContextItemExpression(expression) ||
    isFunctionCallExpression(expression)
  );
}

export function isLiteralExpression(
  expression: Expression
): expression is LiteralExpression {
  return isIntegerLiteralExpression(expression);
}

export function isIntegerLiteralExpression(
  expression: Expression
): expression is IntegerLiteralExpression {
  return expression.type === ExpressionType.IntegerLiteral;
}

export function isContextItemExpression(
  expression: Expression
): expression is ContextItemExpression {
  return expression.type === ExpressionType.ContextItem;
}

export function isFunctionCallExpression(
  expression: Expression
): expression is FunctionCallExpression {
  return expression.type === ExpressionType.FunctionCall;
}

export function isPathExpression(
  expression: Expression
): expression is PathExpression {
  return expression.type === ExpressionType.Path;
}

export function isStepExpression(
  expression: Expression
): expression is StepExpression {
  return isPostfixExpression(expression) || isAxisExpression(expression);
}

export function isPostfixExpression(
  expression: Expression
): expression is PostfixExpression {
  return isPrimaryExpression(expression) || isFilterExpression(expression);
}

export function isFilterExpression(
  expression: Expression
): expression is FilterExpression {
  return expression.type === ExpressionType.Filter;
}

export function isAxisExpression(
  expression: Expression
): expression is AxisExpression {
  return expression.type === ExpressionType.Axis;
}

export function isKindTest(test: NodeTest): test is KindTest {
  return "kind" in test;
}

export function isNameTest(test: NodeTest): test is NameTest {
  return "kind" in test === false;
}
