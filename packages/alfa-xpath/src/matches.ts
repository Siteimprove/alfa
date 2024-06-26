import { decimal, double, element, integer } from "./descriptors.js";
import type { Item } from "./types.js";

/**
 * @internal
 */
export function matches<T extends Item.Type>(
  item: Item<any>,
  type: T,
): item is Item<Item.Value<T>> {
  return derivesFrom(item.type, type);
}

function derivesFrom<T extends Item.Type>(
  actual: Item.Type,
  expected: T,
): actual is T {
  if (actual.type === expected.type) {
    return true;
  }

  switch (expected.type) {
    case "node":
      return derivesFrom(actual, element());

    case "numeric":
      return (
        derivesFrom(actual, integer()) ||
        derivesFrom(actual, decimal()) ||
        derivesFrom(actual, double())
      );
  }

  return false;
}
