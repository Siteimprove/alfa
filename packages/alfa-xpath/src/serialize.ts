import * as g from "./guards";
import * as t from "./types";
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
      serializeAxis(axis),
      serializeNodeTest(test),
      serializePredicates(predicates)
    ];

    return parts.join("");
  }

  if (g.isPathExpression(expression)) {
    const { left, right } = expression;

    const parts = [serialize(left), serialize(right)];

    return parts.join("/");
  }

  if (g.isFilterExpression(expression)) {
    const { base, predicates } = expression;

    const parts = [serialize(base), serializePredicates(predicates)];

    return parts.join("");
  }

  if (g.isFunctionCallExpression(expression)) {
    const { prefix, name, parameters } = expression;

    const parts = [
      serializeName(name, prefix),
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

function serializeName(name: string, prefix: string | null): string {
  return `${prefix === null ? "" : `${prefix}:`}${name}`;
}

function serializeAxis(axis: t.Axis): string {
  switch (axis) {
    case "child":
      return "";

    case "attribute":
      return "@";

    default:
      return `${axis}::`;
  }
}

function serializeNodeTest(test: t.NodeTest | null): string {
  if (test === null) {
    return "*";
  }

  if (g.isKindTest(test)) {
    const parts = [
      test.kind,
      "(",
      test.kind === "element" || test.kind === "attribute"
        ? test.name === null
          ? ""
          : test.name
        : "",
      ")"
    ];

    return parts.join("");
  }

  return test.name;
}
