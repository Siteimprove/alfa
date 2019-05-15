import { FunctionMap } from "./function";
import { Item } from "./types";

export interface Environment<T extends Item.Value = Item.Value> {
  readonly focus: Focus<T>;
  readonly functions: FunctionMap;
}

export interface Focus<T extends Item.Value = Item.Value> extends Item<T> {
  readonly position: number;
}

export function withFocus<T extends Item.Value, U extends Item.Value>(
  environment: Environment<T>,
  focus: Focus<U>
): Environment<U> {
  return { ...environment, focus };
}
