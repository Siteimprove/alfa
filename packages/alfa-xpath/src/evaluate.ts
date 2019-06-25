import {
  isAttribute,
  isComment,
  isDocument,
  isElement,
  isText,
  Node
} from "@siteimprove/alfa-dom";
import { ExpressionBuilder } from "./builder";
import { coerceItems } from "./coerce";
import { boolean, integer, node, numeric, string } from "./descriptors";
import { Environment, Focus, withFocus } from "./environment";
import { lookupFunction } from "./function";
import { functions } from "./functions";
import * as g from "./guards";
import { matches } from "./matches";
import { parse } from "./parse";
import { getTree, Tree, walkTree } from "./tree";
import * as t from "./types";
import { Expression, Item, Type, Value } from "./types";

export interface EvaluateOptions {
  readonly composed?: boolean;
  readonly flattened?: boolean;
}

export function* evaluate(
  scope: Node,
  context: Node,
  expression: string | Expression | ExpressionBuilder,
  options: EvaluateOptions = {}
): Iterable<Node> {
  if (typeof expression === "string") {
    const parsed = parse(expression);

    if (parsed === null) {
      return;
    }

    expression = parsed;
  }

  if (expression instanceof ExpressionBuilder) {
    expression = expression.expression;
  }

  const tree = getTree(scope, context);

  if (tree === null) {
    return;
  }

  const environment: Environment<Tree<Node>> = {
    focus: {
      type: node(),
      value: tree,
      position: 1
    },
    functions
  };

  const branches = evaluateExpression(expression, environment, options);

  for (const branch of branches) {
    if (matches(branch, node())) {
      yield branch.value.node;
    }
  }
}

function* evaluateExpression<T extends Item.Value>(
  expression: Expression,
  environment: Environment<T>,
  options: EvaluateOptions
): Iterable<Item> {
  if (g.isPathExpression(expression)) {
    yield* evaluatePathExpression(expression, environment, options);
  } else if (g.isAxisExpression(expression)) {
    yield* evaluateAxisExpression(expression, environment, options);
  } else if (g.isFunctionCallExpression(expression)) {
    yield* evaluateFunctionCallExpression(expression, environment, options);
  } else if (g.isLiteralExpression(expression)) {
    yield* evaluateLiteralExpression(expression, environment, options);
  } else if (g.isContextItemExpression(expression)) {
    yield* evaluateContextItemExpression(expression, environment, options);
  }
}

function* evaluatePathExpression<T extends Item.Value>(
  expression: t.PathExpression,
  environment: Environment<T>,
  options: EvaluateOptions
): Iterable<Item> {
  const result: Array<Item> = [];

  const context = evaluateExpression(expression.left, environment, options);

  let position = 1;

  for (const item of context) {
    const { type, value } = item;

    const focus: Focus<Item.Value> = {
      type,
      value,
      position: position++
    };

    result.push(
      ...evaluateExpression(
        expression.right,
        withFocus(environment, focus),
        options
      )
    );
  }

  const hasNode = result.some(item => matches(item, node()));

  if (hasNode) {
    const seen = new Set<Node>();
    const nodes: Array<Item<Tree>> = [];

    for (const item of result) {
      if (matches(item, node())) {
        if (!seen.has(item.value.node)) {
          seen.add(item.value.node);
          nodes.push(item);
        }
      } else {
        return;
      }
    }

    yield* nodes as Array<Item>;
  } else {
    yield* result;
  }
}

function* evaluateAxisExpression<T extends Item.Value>(
  expression: t.AxisExpression,
  environment: Environment<T>,
  options: EvaluateOptions
): Iterable<Item> {
  const focus: Item = environment.focus;

  if (!matches(focus, node())) {
    return;
  }

  let position = 1;

  loop: for (const branch of walkTree(focus.value, expression.axis)) {
    if (expression.test !== null) {
      const { test } = expression;

      if (g.isKindTest(test)) {
        switch (test.kind) {
          case "document-node":
            if (!isDocument(branch.node)) {
              continue loop;
            }
            break;

          case "element":
            if (!isElement(branch.node)) {
              continue loop;
            }

            if (
              test.name !== null &&
              branch.node.localName !== test.name.toLowerCase()
            ) {
              continue loop;
            }
            break;

          case "attribute":
            if (!isAttribute(branch.node)) {
              continue loop;
            }

            if (
              test.name !== null &&
              branch.node.localName !== test.name.toLowerCase()
            ) {
              continue loop;
            }
            break;

          case "comment":
            if (!isComment(branch.node)) {
              continue loop;
            }
            break;

          case "text":
            if (!isText(branch.node)) {
              continue loop;
            }
        }
      } else {
        if (!isElement(branch.node) && !isAttribute(branch.node)) {
          continue loop;
        }

        if (
          branch.node.localName !== test.name.toLowerCase() ||
          test.prefix !== undefined
        ) {
          continue loop;
        }
      }
    }

    const item = {
      type: node(),
      value: branch
    };

    const focus = {
      ...item,
      position: position++
    };

    for (const predicate of expression.predicates) {
      const keep = evaluatePredicate(
        predicate,
        withFocus(environment, focus),
        options
      );

      if (!keep) {
        continue loop;
      }
    }

    yield item;
  }
}

function* evaluateFunctionCallExpression<T extends Item.Value>(
  expression: t.FunctionCallExpression,
  environment: Environment<T>,
  options: EvaluateOptions
): Iterable<Item> {
  const { prefix, name, arity } = expression;

  const fn = lookupFunction(environment.functions, prefix, name, arity);

  if (fn === null) {
    return;
  }

  const parameters = [...expression.parameters].reduce<Array<Value> | null>(
    (parameters, expression, i) => {
      if (parameters !== null) {
        const parameter = coerceItems(
          evaluateExpression(expression, environment, options),
          fn.parameters[i]
        );

        if (parameter === null) {
          return null;
        }

        parameters.push(parameter);
      }

      return parameters;
    },
    []
  );

  if (parameters === null) {
    return;
  }

  const as = <T extends Type>(value: Value, type: T): Value<T> => {
    return value as Value<T>;
  };

  switch (fn.result.type) {
    case "*":
    case "+": {
      const result = as(fn.apply(environment, ...parameters), fn.result);

      for (const value of result) {
        yield { type: fn.result.properties.descriptor, value };
      }

      break;
    }

    case "?": {
      const result = as(fn.apply(environment, ...parameters), fn.result);

      if (result !== undefined) {
        yield { type: fn.result.properties.descriptor, value: result };
      }

      break;
    }

    default:
      const result = as(fn.apply(environment, ...parameters), fn.result);

      yield { type: fn.result, value: result };
  }
}

function* evaluateLiteralExpression<T extends Item.Value>(
  expression: t.LiteralExpression,
  environment: Environment<T>,
  options: EvaluateOptions
): Iterable<Item> {
  if (g.isIntegerLiteralExpression(expression)) {
    yield { type: integer(), value: expression.value };
  }
}

function evaluatePredicate<T extends Item.Value>(
  expression: t.Expression,
  environment: Environment<T>,
  options: EvaluateOptions
): boolean {
  const result = [...evaluateExpression(expression, environment, options)];

  switch (result.length) {
    case 0:
      return false;

    case 1:
      const [item] = result;

      if (matches(item, boolean())) {
        return item.value;
      }

      if (matches(item, string())) {
        return item.value.length !== 0;
      }

      if (matches(item, numeric())) {
        return item.value === environment.focus.position;
      }
  }

  return matches(result[0], node());
}

function* evaluateContextItemExpression<T extends Item.Value>(
  expression: t.ContextItemExpression,
  environment: Environment<T>,
  options: EvaluateOptions
): Iterable<Item> {
  const { type, value } = environment.focus;
  yield { type, value };
}
