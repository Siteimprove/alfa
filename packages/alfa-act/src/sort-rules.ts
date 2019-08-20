import { isComposite } from "./guards";
import { Aspect, Composition, Rule, Target } from "./types";

/**
 * @internal
 */
export function sortRules<A extends Aspect, T extends Target>(
  rules: Iterable<Rule<A, T>>
): Iterable<Rule<A, T>> {
  const result: Array<Rule<A, T>> = [];

  const indegrees = new Map<Rule<A, T>, number>();

  for (const rule of rules) {
    if (isComposite(rule)) {
      const composition = new Composition<A, T>();

      rule.compose(composition);

      for (const neighbour of composition) {
        const indegree = indegrees.get(neighbour);

        if (indegree === undefined) {
          indegrees.set(neighbour, 1);
        } else {
          indegrees.set(neighbour, indegree + 1);
        }
      }
    }
  }

  const leaves = [...rules].filter(rule => !indegrees.has(rule));

  let next = leaves.pop();

  while (next !== undefined) {
    result.unshift(next);

    if (isComposite(next)) {
      const composition = new Composition<A, T>();

      next.compose(composition);

      for (const neighbour of composition) {
        const indegree = indegrees.get(neighbour);

        if (indegree === undefined) {
          continue;
        }

        indegrees.set(neighbour, indegree - 1);

        if (indegree === 1) {
          leaves.push(neighbour);
        }
      }
    }

    next = leaves.pop();
  }

  return result;
}
