import { isAttribute, isElement, Node } from "@siteimprove/alfa-dom";
import { coerceItems, coerceValue } from "./coerce";
import { integer, node } from "./descriptors";
import { Environment, Focus, withFocus } from "./environment";
import { lookupFunction } from "./function";
import { functions } from "./functions";
import * as g from "./guards";
import { matches } from "./matches";
import { parse } from "./parse";
import { getTree, Tree, walkTree } from "./tree";
import * as t from "./types";
import { Expression, Item, Value } from "./types";

export interface EvaluateOptions {
  composed?: boolean;
  flattened?: boolean;
}

export function* evaluate(
  scope: Node,
  context: Node,
  expression: string | Expression,
  options: EvaluateOptions = {}
): Iterable<Node> {
  if (typeof expression === "string") {
    const parsed = parse(expression);

    if (parsed === null) {
      return;
    }

    expression = parsed;
  }

  const tree = getTree(scope, context);

  if (tree === null) {
    return;
  }

  const environment: Environment<Tree<Node>> = {
    focus: {
      type: node(),
      value: tree,
      position: 1,
      size: 1
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

function* evaluateExpression(
  expression: Expression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Item> {
  if (g.isPathExpression(expression)) {
    yield* evaluatePathExpression(expression, environment, options);
  }

  if (g.isAxisExpression(expression)) {
    yield* evaluateAxisExpression(expression, environment, options);
  }

  if (g.isFunctionCallExpression(expression)) {
    yield* evaluateFunctionCallExpression(expression, environment, options);
  }

  if (g.isLiteralExpression(expression)) {
    yield* evaluateLiteralExpression(expression);
  }
}

function* evaluatePathExpression(
  expression: t.PathExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Item> {
  const result: Array<Item> = [];

  const context = [
    ...evaluateExpression(expression.left, environment, options)
  ];

  for (let i = 0, n = context.length; i < n; i++) {
    const { type, value } = context[i];

    const focus: Focus = {
      type,
      value,
      position: i + 1,
      size: n
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

    yield* nodes;
  } else {
    yield* result;
  }
}

function* evaluateAxisExpression(
  expression: t.AxisExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Item> {
  const focus: Item = environment.focus;

  if (matches(focus, node())) {
    let branches = walkTree(focus.value, expression.axis);

    if (expression.test !== null) {
      branches = evaluateNodeTest(expression.test, branches);
    }

    for (const branch of branches) {
      yield { type: node(), value: branch };
    }
  }
}

function* evaluateNodeTest(
  test: t.NodeTest,
  branches: Iterable<Tree>
): Iterable<Tree> {
  for (const branch of branches) {
    const { node } = branch;

    if (g.isKindTest(test)) {
      if (node.nodeType === test.kind) {
        yield branch;
      }
    } else {
      if (isElement(node) || isAttribute(node)) {
        if (node.localName === test.name && test.prefix === undefined) {
          yield branch;
        }
      }
    }
  }
}

function* evaluateFunctionCallExpression(
  expression: t.FunctionCallExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Item> {
  const { prefix, name, arity } = expression;

  const fn = lookupFunction(environment.functions, prefix, name, arity);

  if (fn !== null) {
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

    if (parameters !== null) {
      switch (fn.result.type) {
        case "*":
        case "+": {
          const values = coerceValue(
            fn.apply(environment, ...parameters),
            fn.result
          );

          if (values !== null) {
            for (const value of values) {
              yield { type: fn.result.properties.descriptor, value };
            }
          }

          break;
        }

        case "?": {
          const value = coerceValue(
            fn.apply(environment, ...parameters),
            fn.result
          );

          if (value !== null && value !== undefined) {
            yield { type: fn.result.properties.descriptor, value };
          }

          break;
        }

        default: {
          const value = coerceValue(
            fn.apply(environment, ...parameters),
            fn.result
          );

          if (value !== null) {
            yield { type: fn.result, value };
          }
        }
      }
    }
  }
}

function* evaluateLiteralExpression(
  expression: t.LiteralExpression
): Iterable<Item> {
  if (g.isIntegerLiteralExpression(expression)) {
    yield { type: integer(), value: expression.value };
  }
}
