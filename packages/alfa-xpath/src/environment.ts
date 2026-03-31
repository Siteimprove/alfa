import type { FunctionMap } from "./function.ts";
import type { Item } from "./types.ts";

/**
 * @internal
 */
export interface Environment<T extends Item.Value> {
  readonly focus: Focus<T>;
  readonly functions: FunctionMap;
}

/**
 * @internal
 */
export interface Focus<T extends Item.Value> extends Item<T> {
  readonly position: number;
}

/**
 * @internal
 */
export function withFocus<T extends Item.Value, U extends Item.Value>(
  environment: Environment<T>,
  focus: Focus<U>,
): Environment<U> {
  return { ...environment, focus };
}
