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
  device: Device,
  isAcceptable: (device: Device) => Predicate<Text> = () => () => true,
): (text: Text) => string {
  return (text) =>
    Selective.of(text)
      .if(isAcceptable(device), (text) => text.data)
      .if(and(isRendered(device), isWhitespace), () => " ")
      .else(() => "")
      .get();
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 */
function fromNode(
  device: Device,
  isAcceptable: (device: Device) => Predicate<Text> = () => () => true,
): (node: Node) => string {
  return (node) => {
    let result = "";

    for (const child of node.children(Node.flatTree)) {
      result += Selective.of(child)
        .if(isText, fromText(device, isAcceptable))
        .if(isElement, fromElement(device, isAcceptable))
        .else(fromNode(device, isAcceptable))
        .get();
    }

    //Returning the whole text from the children
    return result;
  };
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 */
function fromElement(
  device: Device,
  isAcceptable: (device: Device) => Predicate<Text> = () => () => true,
): (element: Element) => string {
  return (element) => {
    if (!isRendered(device)(element)) {
      return "";
    }

    if (hasName("br")(element)) {
      return "\n";
    }

    if (hasName("p")(element)) {
      // We return 2 newline here, according to HTML inner text algorithm.
      // This differs from Alfa's visible inner text, which is OK since main
      // use
      // cases will normalise the string afterward.
      // {@link
      // https://html.spec.whatwg.org/multipage/dom.html#rendered-text-collection-steps}
      // (Step 8)
      return "\n\n" + fromNode(device, isAcceptable)(element) + "\n\n";
    }

    const display = Style.from(element, device).computed("display").value;
    const {
      values: [outside], // this covers both outside and internal specified.
    } = display;

    if (outside.value === "block" || outside.value === "table-caption") {
      return "\n" + fromNode(device, isAcceptable)(element) + "\n";
    }

    if (outside.value === "table-cell" || outside.value === "table-row") {
      return " " + fromNode(device, isAcceptable)(element) + " ";
    }

    return fromNode(device, isAcceptable)(element);
  };
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 *
 * @remarks
 * depending on use cases, we may want the visible or perceivable text, hence
 * this is parametric with a predicate.
 */
export const innerText = fromElement;
