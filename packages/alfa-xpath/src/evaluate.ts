import {
  Attribute,
  Comment,
  Document,
  Element,
  Text,
  Node
} from "@siteimprove/alfa-dom";
import { ExpressionBuilder } from "./builder";
import { coerceItems } from "./coerce";
import * as d from "./descriptors";
import { Environment, Focus, withFocus } from "./environment";
import { lookupFunction } from "./function";
import { functions } from "./functions";
import * as g from "./guards";
import { matches } from "./matches";
import { parse } from "./parse";
import * as t from "./types";
import { Expression, Item, Type, Value } from "./types";
import { walk } from "./walk";

export function* evaluate(
  scope: Node,
  expression: string | Expression | ExpressionBuilder,
  options: evaluate.Options = {}
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

  const environment: Environment<Node> = {
    focus: {
      type: d.node(),
      value: scope,
      position: 1
    },
    functions
  };

  const items = evaluateExpression(expression, environment, options);

  for (const item of items) {
    if (matches(item, d.node())) {
      yield item.value;
    }
  }
}

export namespace evaluate {
  export interface Options extends Node.Traversal {}
}

function* evaluateExpression<T extends Item.Value>(
  expression: Expression,
  environment: Environment<T>,
  options: evaluate.Options
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
  options: evaluate.Options
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

  const hasNode = result.some(item => matches(item, d.node()));

  if (hasNode) {
    const seen = new Set<Node>();
    const nodes: Array<Item<Node>> = [];

    for (const item of result) {
      if (matches(item, d.node())) {
        if (!seen.has(item.value)) {
          seen.add(item.value);
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
  options: evaluate.Options
): Iterable<Item> {
  const focus: Item = environment.focus;

  if (!matches(focus, d.node())) {
    return;
  }

  let position = 1;

  loop: for (const node of walk(focus.value, expression.axis)) {
    if (expression.test !== null) {
      const { test } = expression;

      if (g.isKindTest(test)) {
        switch (test.kind) {
          case "document-node":
            if (!Document.isDocument(node)) {
              continue loop;
            }
            break;

          case "element":
            if (!Element.isElement(node)) {
              continue loop;
            }

            if (test.name !== null && node.name !== test.name.toLowerCase()) {
              continue loop;
            }
            break;

          case "attribute":
            if (!Attribute.isAttribute(node)) {
              continue loop;
            }

            if (test.name !== null && node.name !== test.name.toLowerCase()) {
              continue loop;
            }
            break;

          case "comment":
            if (!Comment.isComment(node)) {
              continue loop;
            }
            break;

          case "text":
            if (!Text.isText(node)) {
              continue loop;
            }
        }
      } else {
        if (!Element.isElement(node) && !Attribute.isAttribute(node)) {
          continue loop;
        }

        if (
          node.name !== test.name.toLowerCase() ||
          test.prefix !== undefined
        ) {
          continue loop;
        }
      }
    }

    const item = { type: d.node(), value: node };

    const focus = { ...item, position: position++ };

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
  options: evaluate.Options
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
      const result = as(
        fn.apply(environment, options, ...parameters),
        fn.result
      );

      for (const value of result) {
        yield { type: fn.result.properties.descriptor, value };
      }

      break;
    }

    case "?": {
      const result = as(
        fn.apply(environment, options, ...parameters),
        fn.result
      );

      if (result !== undefined) {
        yield { type: fn.result.properties.descriptor, value: result };
      }

      break;
    }

    default:
      const result = as(
        fn.apply(environment, options, ...parameters),
        fn.result
      );

      yield { type: fn.result, value: result };
  }
}

function* evaluateLiteralExpression<T extends Item.Value>(
  expression: t.LiteralExpression,
  environment: Environment<T>,
  options: evaluate.Options
): Iterable<Item> {
  if (g.isIntegerLiteralExpression(expression)) {
    yield { type: d.integer(), value: expression.value };
  }
}

function evaluatePredicate<T extends Item.Value>(
  expression: t.Expression,
  environment: Environment<T>,
  options: evaluate.Options
): boolean {
  const result = [...evaluateExpression(expression, environment, options)];

  switch (result.length) {
    case 0:
      return false;

    case 1:
      const [item] = result;

      if (matches(item, d.boolean())) {
        return item.value;
      }

      if (matches(item, d.string())) {
        return item.value.length !== 0;
      }

      if (matches(item, d.numeric())) {
        return item.value === environment.focus.position;
      }
  }

  return matches(result[0], d.node());
}

function* evaluateContextItemExpression<T extends Item.Value>(
  expression: t.ContextItemExpression,
  environment: Environment<T>,
  options: evaluate.Options
): Iterable<Item> {
  const { type, value } = environment.focus;
  yield { type, value };
}
