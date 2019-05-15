import { element } from "./descriptors";
import { Item } from "./types";

export function matches<T extends Item.Type>(
  item: Item,
  type: T
): item is Item<Item.Value<T>> {
  return derivesFrom(item.type, type);
}

function derivesFrom<T extends Item.Type>(
  actual: Item.Type,
  expected: T
): actual is T {
  if (actual.type === expected.type) {
    return true;
  }

  switch (expected.type) {
    case "node":
      return derivesFrom(actual, element());
  }

  return false;
}
