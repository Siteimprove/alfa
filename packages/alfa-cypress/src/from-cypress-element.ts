import { Assertable } from "@siteimprove/alfa-assert";
import {
  fromJQueryWrapper,
  isJQueryWrapper,
  JQueryWrapper
} from "@siteimprove/alfa-jquery";

export function fromCypressElement<T>(
  cypressElement: Assertable | JQueryWrapper
): Assertable {
  if (isJQueryWrapper(cypressElement)) {
    return fromJQueryWrapper(cypressElement);
  }

  return cypressElement;
}
