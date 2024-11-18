import type { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Selective } from "@siteimprove/alfa-selective";
import { String } from "@siteimprove/alfa-string";

import { Style } from "../../style.js";
import { isRendered } from "../predicate/is-rendered.js";

const { hasName, isElement } = Element;
const { isText } = Text;
const { and } = Predicate;

const isWhitespace: Predicate<Text> = (text) =>
  String.isWhitespace(text.data, false);

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
  return Selective.of(text)
    .if(isAcceptable, () => text.data)
    .if(and(isRendered(device), isWhitespace), () => " ")
    .else(() => "")
    .get();
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
    result += Selective.of(child)
      .if(isText, (text) => fromText(isAcceptable, text, device))
      .if(isElement, (element) => fromElement(isAcceptable, element, device))
      .else(() => fromNode(isAcceptable, child, device))
      .get();
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
    // We return 2 newline here, according to HTML inner text algorithm.
    // This differs from Alfa's visible inner text, which is OK since main use
    // cases will normalise the string afterward.
    // {@link https://html.spec.whatwg.org/multipage/dom.html#rendered-text-collection-steps}
    // (Step 8)
    return "\n\n" + fromNode(isAcceptable, element, device) + "\n\n";
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
 *
 * @remarks
 * depending on use cases, we may want the visible or perceivable text, hence
 * this is parametric with a predicate.
 */
export const innerText = fromElement;
