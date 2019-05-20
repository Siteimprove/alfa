import * as g from "./guards";
import { Expression } from "./types";

export function serialize(expression: Expression): string {
  if (g.isLiteralExpression(expression)) {
    return String(expression.value);
  }

  if (g.isContextItemExpression(expression)) {
    return ".";
  }

  if (g.isAxisExpression(expression)) {
    const { axis, test, predicates } = expression;

    const parts = [
      axis,
      "::",
      test === null ? "*" : g.isKindTest(test) ? test.kind : test.name,
      serializePredicates(predicates)
    ];

    return parts.join("");
  }

  if (g.isPathExpression(expression)) {
    const { left, right } = expression;

    return `${serialize(left)}/${serialize(right)}`;
  }

  if (g.isFilterExpression(expression)) {
    const { base, predicates } = expression;

    return `${serialize(base)}${serializePredicates(predicates)}`;
  }

  if (g.isFunctionCallExpression(expression)) {
    const { prefix, name, parameters } = expression;

    const parts = [
      prefix === null ? "" : `${prefix}:`,
      name,
      "(",
      [...parameters].map(serialize).join(", "),
      ")"
    ];

    return parts.join("");
  }

  throw new Error(`Cannot serialize expression of type ${expression.type}`);
}

function serializePredicates(predicates: Iterable<Expression>): string {
  return [...predicates].map(predicate => `[${serialize(predicate)}]`).join("");
}
