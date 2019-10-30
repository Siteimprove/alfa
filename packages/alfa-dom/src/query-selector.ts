import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";
import { Element, Node } from "./types";

/**
 * Given a scope and a context, get the first node within the scope that matches
 * the given selector or predicate within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-parentnode-queryselector
 */
export function querySelector<T extends Node = Element>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: querySelector.Options = {}
): Option<T> {
  return Iterable.first(querySelectorAll(scope, context, query, options));
}

export namespace querySelector {
  export type Options = traverseNode.Options;
}

/**
 * Given a scope and a context, get all nodes within the scope that match the
 * given selector or predicate within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-parentnode-queryselectorall
 */
export function querySelectorAll<T extends Node = Element>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: querySelectorAll.Options = {}
): Iterable<T> {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const matchesOptions = {
      ...options,
      scope: isElement(scope) ? scope : undefined
    };
    predicate = node =>
      isElement(node) && matches(node, context, query, matchesOptions);
  } else {
    predicate = query;
  }

  return traverseNode(
    scope,
    context,
    {
      *enter(node) {
        if (Predicate.test(predicate, node)) {
          yield node;
        }
      }
    },
    options
  );
}

export namespace querySelectorAll {
  export type Options = traverseNode.Options;
}
