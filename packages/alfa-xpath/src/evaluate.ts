import { isElement, Node } from "@siteimprove/alfa-dom";
import { coerceItems, coerceValue } from "./coerce";
import { node } from "./descriptors";
import { Environment, Focus, withFocus } from "./environment";
import { lookupFunction } from "./function";
import { functions } from "./functions";
import * as g from "./guards";
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
): Iterable<Node> | null {
  if (typeof expression === "string") {
    const parsed = parse(expression);

    if (parsed === null) {
      return null;
    }

    expression = parsed;
  }

  const tree = getTree(scope, context);

  if (tree === null) {
    return null;
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
    yield branch.value.node;
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
}

function* evaluatePathExpression(
  expression: t.PathExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Item> {
  const outer = [...evaluateExpression(expression.left, environment, options)];

  const seen = new Set<Item.Value>();

  for (let i = 0, n = outer.length; i < n; i++) {
    const { type, value } = outer[i];

    const focus: Focus = {
      type,
      value,
      position: i + 1,
      size: n
    };

    const inner = evaluateExpression(
      expression.right,
      withFocus(environment, focus),
      options
    );

    for (const item of inner) {
      if (seen.has(item.value)) {
        continue;
      }

      seen.add(item.value);

      yield item;
    }
  }
}

function* evaluateAxisExpression(
  expression: t.AxisExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Item> {
  let branches = walkTree(environment.focus.value, expression.axis);

  if (expression.test !== undefined) {
    branches = evaluateNodeTest(expression.test, branches);
  }

  for (const branch of branches) {
    yield { type: node(), value: branch };
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
      if (
        isElement(node) &&
        node.localName === test.name &&
        test.prefix === undefined
      ) {
        yield branch;
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
