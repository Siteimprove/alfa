import { JQueryWrapper } from "./types";

export function isJQueryWrapper<T>(value: unknown): value is JQueryWrapper {
  return isObject(value) && "jquery" in value;
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}
