/// <reference types="jquery" />

import { Assertable, isAssertable } from "@siteimprove/alfa-assert";
import { isJQueryWrapper } from "@siteimprove/alfa-jquery";

export function isCypressElement<T>(
  input: unknown
): input is Assertable | JQuery {
  return isAssertable(input) || isJQueryWrapper(input);
}
