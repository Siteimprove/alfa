/// <reference lib="dom" />

import { isCheerioWrapper } from "@siteimprove/alfa-cheerio";
import { VueWrapper } from "./types";

export function isVueWrapper(value: unknown): value is VueWrapper {
  return (
    (isObject(value) &&
      value.vm !== undefined &&
      value.element instanceof Element) ||
    isCheerioWrapper(value)
  );
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}
