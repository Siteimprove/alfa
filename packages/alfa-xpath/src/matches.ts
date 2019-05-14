import { Item } from "./types";

export function matches<T extends Item.Type>(
  item: Item,
  type: T
): item is Item<Item.Value<T>> {
  return true;
}
