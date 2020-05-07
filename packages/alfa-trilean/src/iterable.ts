import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "./predicate";

export function some<T>(predicate: Predicate<T>): Predicate<Iterable<T>> {
  return (iterable) =>
    Iterable.reduce(
      iterable,
      (pred: Predicate<void>, val) => Predicate.or(pred, () => predicate(val)),
      () => false
    )();
}

export function every<T>(predicate: Predicate<T>): Predicate<Iterable<T>> {
  return (iterable) =>
    Iterable.reduce(
      iterable,
      (pred: Predicate<void>, val) => Predicate.and(pred, () => predicate(val)),
      () => true
    )();
}
