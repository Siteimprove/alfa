import { isIterable } from "@siteimprove/alfa-util";
import { Aspect, Atomic, Composite, Rule, Target } from "./types";

export function isTargetUnit<
  T extends Target,
  U extends T extends Iterable<infer G> ? never : T
>(target: T): target is U {
  return !isIterable(target);
}

export function isTargetGroup<
  T extends Target,
  G extends T extends Iterable<infer G> ? T : never
>(target: T): target is G {
  return isIterable(target);
}

export function isAtomic<A extends Aspect, T extends Target>(
  rule: Rule<A, T>
): rule is Atomic.Rule<A, T> {
  return "compose" in rule === false;
}

export function isComposite<A extends Aspect, T extends Target>(
  rule: Rule<A, T>
): rule is Composite.Rule<A, T> {
  return "compose" in rule;
}
