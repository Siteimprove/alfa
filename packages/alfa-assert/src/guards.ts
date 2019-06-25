import { isDocument, isElement, Node } from "@siteimprove/alfa-dom";
import { hasKey, isNumber, isObject } from "@siteimprove/alfa-util";
import { Assertable } from "./types";

function isNode(input: unknown): input is Node {
  return (
    isObject(input) && hasKey(input, "nodeType") && isNumber(input.nodeType)
  );
}

export function isAssertable(input: unknown): input is Assertable {
  return isNode(input) && (isDocument(input) || isElement(input));
}
