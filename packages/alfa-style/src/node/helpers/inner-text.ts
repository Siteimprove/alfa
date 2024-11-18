import type { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { String } from "@siteimprove/alfa-string";

import { Style } from "../../style.js";
import { isRendered } from "../predicate/is-rendered.js";

const { hasName, isElement } = Element;
const { isText } = Text;
const { and, not } = Predicate;

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 *
 * @remarks
 * depending on use cases, we may want the visible or perceivable text, hence
 * this is parametric with a predicate.
 */
function fromText(
  isAcceptable: Predicate<Text>,
  text: Text,
  device: Device,
): string {
  if (isAcceptable(text)) {
    return text.data;
  }

  if (
    and(not(isAcceptable), isRendered(device))(text) &&
    String.isWhitespace(text.data, false)
  ) {
    return " ";
  }

  return "";
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 */
function fromNode(
  isAcceptable: Predicate<Text>,
  node: Node,
  device: Device,
): string {
  let result = "";

  for (const child of node.children(Node.flatTree)) {
    if (isText(child)) {
      result = result + fromText(isAcceptable, child, device);
    } else if (isElement(child)) {
      result = result + fromElement(isAcceptable, child, device);
    } else {
      result = result + fromNode(isAcceptable, child, device);
    }
  }

  //Returning the whole text from the children
  return result;
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 */
function fromElement(
  isAcceptable: Predicate<Text>,
  element: Element,
  device: Device,
): string {
  if (!isRendered(device)(element)) {
    return "";
  }

  if (hasName("br")(element)) {
    return "\n";
  }

  if (hasName("p")(element)) {
    return "\n" + fromNode(isAcceptable, element, device) + "\n";
  }

  const display = Style.from(element, device).computed("display").value;
  const {
    values: [outside], // this covers both outside and internal specified.
  } = display;

  if (outside.value === "block" || outside.value === "table-caption") {
    return "\n" + fromNode(isAcceptable, element, device) + "\n";
  }

  if (outside.value === "table-cell" || outside.value === "table-row") {
    return " " + fromNode(isAcceptable, element, device) + " ";
  }

  return fromNode(isAcceptable, element, device);
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 */
export const innerText = fromElement;
