import { Aspect, Atomic, Composite, Group, Rule, Target } from "./types";

export function isTargetUnit<
  T extends Target,
  U extends T extends Group<infer G> ? never : T
>(target: T): target is U {
  return target instanceof Set === false;
}

export function isTargetGroup<
  T extends Target,
  G extends T extends Group<infer G> ? T : never
>(target: T): target is G {
  return target instanceof Set;
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
