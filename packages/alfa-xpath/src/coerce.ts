import { matches } from "./matches";
import { Item, Type, Value } from "./types";

/**
 * @internal
 */
export function coerceItems(items: Iterable<Item>, type: Type): Value | null {
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
    case "+":
      const values: Array<Item.Value> = [];

      for (const item of items) {
        if (matches(item, type.properties.descriptor)) {
          values.push(item.value);
        } else {
          return null;
        }
      }

      if (type.type === "+" && values.length < 1) {
        return null;
      }

      return values;

    default:
      for (const item of items) {
        if (matches(item, type)) {
          return item.value;
        } else {
          return null;
        }
      }

      return null;
  }
}
