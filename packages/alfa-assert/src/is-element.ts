import { Element, NodeType } from "@siteimprove/alfa-dom";
import { hasKey, isNumber, isObject } from "@siteimprove/alfa-util";

export function isElement(input: unknown): input is Element {
  if (isObject(input) && hasKey(input, "nodeType")) {
    const { nodeType } = input;

    if (isNumber(nodeType)) {
      return nodeType === NodeType.Element;
    }
  }

  return true;
}
