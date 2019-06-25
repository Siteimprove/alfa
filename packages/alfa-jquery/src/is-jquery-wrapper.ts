import { hasKey, isObject } from "@siteimprove/alfa-util";
import { JQueryWrapper } from "./types";

export function isJQueryWrapper<T>(input: unknown): input is JQueryWrapper {
  return isObject(input) && hasKey(input, "jquery");
}
