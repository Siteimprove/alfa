import { JSHandle } from "puppeteer";

export function isPuppeteerHandle(value: unknown): value is JSHandle {
  return isObject(value) && isFunction(value.dispose);
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}
