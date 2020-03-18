import {
  Attribute,
  Comment,
  Document,
  Element,
  Text,
  Node
} from "@siteimprove/alfa-dom";

import { Builder } from "./builder";
import { coerceItems } from "./coerce";
import * as d from "./descriptors";
import { Environment, Focus, withFocus } from "./environment";
import { lookupFunction } from "./function";
import { functions } from "./functions";
import { matches } from "./matches";
import { Expression } from "./expression";
import { Item, Type, Value } from "./types";
import { walk } from "./walk";
import { Parser } from "./syntax/parser";

export function* evaluate(
  scope: Node,
  expression: string | Expression | Builder,
  options: evaluate.Options = {}
): Iterable<Node> {
  if (typeof expression === "string") {
    const parsed = Parser.parse(expression);

    if (parsed.isNone()) {
      return;
    }

    expression = parsed.get();
  }

  if (expression instanceof Builder) {
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
  switch (expression.type) {
    case "path":
      return yield* evaluatePathExpression(expression, environment, options);

    case "axis":
      return yield* evaluateAxisExpression(expression, environment, options);

    case "function-call":
      return yield* evaluateFunctionCallExpression(
        expression,
        environment,
        options
      );

    case "string":
    case "integer":
    case "decimal":
    case "double":
      return yield* evaluateLiteralExpression(expression, environment, options);

    case "context-item":
      return yield* evaluateContextItemExpression(
        expression,
        environment,
        options
      );
  }
}

function* evaluatePathExpression<T extends Item.Value>(
  expression: Expression.Path,
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
  expression: Expression.Axis,
  environment: Environment<T>,
  options: evaluate.Options
): Iterable<Item> {
  const focus: Item = environment.focus;

  if (!matches(focus, d.node())) {
    return;
  }

  let position = 1;

  loop: for (const node of walk(focus.value, expression.axis)) {
    if (expression.test.isSome()) {
      const test = expression.test.get();

      if (test.type === "kind") {
        switch (test.kind) {
          case "document":
            if (!Document.isDocument(node)) {
              continue loop;
            }
            break;

          case "element":
            if (!Element.isElement(node)) {
              continue loop;
            }

            if (
              test.name.isSome() &&
              node.name !== test.name.get().toLowerCase()
            ) {
              continue loop;
            }
            break;

          case "attribute":
            if (!Attribute.isAttribute(node)) {
              continue loop;
            }

            if (
              test.name.isSome() &&
              node.name !== test.name.get().toLowerCase()
            ) {
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

        if (node.name !== test.name.toLowerCase() || test.prefix.isSome()) {
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
  expression: Expression.FunctionCall,
  environment: Environment<T>,
  options: evaluate.Options
): Iterable<Item> {
  const { prefix, name, arity } = expression;

  const fn = lookupFunction(
    environment.functions,
    prefix.getOr(null),
    name,
    arity
  );

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
  expression: Expression.Literal,
  environment: Environment<T>,
  options: evaluate.Options
): Iterable<Item> {
  switch (expression.type) {
    case "integer":
      return yield { type: d.integer(), value: expression.value };
  }
}

function evaluatePredicate<T extends Item.Value>(
  expression: Expression,
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
  expression: Expression.ContextItem,
  environment: Environment<T>,
  options: evaluate.Options
): Iterable<Item> {
  const { type, value } = environment.focus;
  yield { type, value };
}
