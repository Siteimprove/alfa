import { isCheerioWrapper } from "@siteimprove/alfa-cheerio";
import { hasKey, isObject } from "@siteimprove/alfa-util";
import { VueWrapper } from "./types";

export function isVueWrapper(input: unknown): input is VueWrapper {
  return (
    (isObject(input) &&
      hasKey(input, "vm") &&
      hasKey(input, "element") &&
      input.element instanceof Element) ||
    isCheerioWrapper(input)
  );
}
