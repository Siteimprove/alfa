import * as t from "./types";
import { Expression, ExpressionType, Item, Sequence } from "./types";

export function isPrimaryExpression(
  expression: Expression
): expression is t.PrimaryExpression {
  return (
    isLiteralExpression(expression) ||
    isContextItemExpression(expression) ||
    isFunctionCallExpression(expression)
  );
}

export function isLiteralExpression(
  expression: Expression
): expression is t.LiteralExpression {
  return isIntegerLiteralExpression(expression);
}

export function isIntegerLiteralExpression(
  expression: Expression
): expression is t.IntegerLiteralExpression {
  return expression.type === ExpressionType.IntegerLiteral;
}

export function isContextItemExpression(
  expression: Expression
): expression is t.ContextItemExpression {
  return expression.type === ExpressionType.ContextItem;
}

export function isFunctionCallExpression(
  expression: Expression
): expression is t.FunctionCallExpression {
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

export function isItemType(type: Item.Type | Sequence.Type): type is Item.Type {
  return !isSequenceType(type);
}

export function isSequenceType(
  type: Item.Type | Sequence.Type
): type is Sequence.Type {
  switch (type.type) {
    case "*":
    case "+":
    case "?":
      return true;
  }

  return false;
}
