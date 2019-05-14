import { isItemType, isSequenceType } from "./guards";
import { matches } from "./matches";
import { Item, Sequence, Type, Value } from "./types";

export function coerceValue<T extends Type>(
  value: Value,
  type: T
): Value<T> | null {
  return value as Value<T>;
}

export function coerceItems<T extends Type>(
  items: Iterable<Item>,
  type: T
): Value<T> | null {
  if (isItemType(type)) {
    return asItemType(items, type) as Value<T> | null;
  }

  if (isSequenceType(type)) {
    return asSequenceType(items, type) as Value<T> | null;
  }

  return null;
}

function asItemType(items: Iterable<Item>, type: Item.Type): Item.Value | null {
  for (const item of items) {
    if (matches(item, type)) {
      return item.value;
    } else {
      return null;
    }
  }

  return null;
}

function asSequenceType(
  items: Iterable<Item>,
  type: Sequence.Type
): Sequence.Value | null {
  switch (type.type) {
    case "?":
      for (const item of items) {
        if (matches(item, type.properties.descriptor)) {
          return item.value;
        } else {
          return null;
        }
      }

      return undefined;

    case "*":
      const values: Array<Item.Value> = [];

      for (const item of items) {
        if (matches(item, type.properties.descriptor)) {
          values.push(item.value);
        } else {
          return null;
        }
      }

      return values;
  }

  return null;
}
