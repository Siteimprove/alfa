import { Aspect, Atomic, Composite, Rule, Target } from "./types";

export function isAtomic<A extends Aspect, T extends Target>(
  rule: Rule<A, T>
): rule is Atomic.Rule<A, T> {
  return "composes" in rule === false;
}

export function isComposite<A extends Aspect, T extends Target>(
  rule: Rule<A, T>
): rule is Composite.Rule<A, T> {
  return "composes" in rule;
}
