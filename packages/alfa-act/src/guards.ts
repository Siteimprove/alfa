import { isIterable } from "@siteimprove/alfa-util";
import { Aspect, Atomic, Composite, Rule, Target } from "./types";

type Iterables<T> = T extends Iterable<infer U> ? T : never;

export function isTargetUnit(
  target: Target
): target is Exclude<Target, Iterable<Target>> {
  return !isIterable(target);
}

export function isTargetGroup(target: Target): target is Iterables<Target> {
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
