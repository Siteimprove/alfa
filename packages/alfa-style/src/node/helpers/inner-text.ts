import type { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Selective } from "@siteimprove/alfa-selective";
import { String } from "@siteimprove/alfa-string";

import { Style } from "../../style.js";
import { isRendered } from "../predicate/is-rendered.js";

const { hasName, isElement } = Element;
const { isText } = Text;
const { and, not } = Predicate;

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
  wrapper: string = "",
): (node: Node) => string {
  return (node) =>
    wrapper +
    node
      .children(Node.flatTree)
      .map((child) =>
        Selective.of(child)
          .if(isText, fromText(device, isAcceptable))
          .if(isElement, fromElement(device, isAcceptable))
          .else(fromNode(device, isAcceptable))
          .get(),
      )
      .join("") +
    wrapper;
}

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 * {@link https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute}
 *
 * @remarks
 * This differs from the HTML innerText algorithm which collapses adjacent newline
 * (keeping only the maximum), and a few other cleanup. Our main use cases will
 * normalise the string afterward, so this is OK. But we will need to update
 * that if we need to more closely reflects HTML algorithm.
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
      return fromNode(device, isAcceptable, "\n\n")(element);
    }

    const {
      values: [outside], // this covers both outside and internal specified.
    } = Style.from(element, device).computed("display").value;

    if (outside.is("block", "table-caption")) {
      return fromNode(device, isAcceptable, "\n")(element);
    }

    if (outside.is("table-cell", "table-row")) {
      return fromNode(device, isAcceptable, " ")(element);
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
