import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getAttribute,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelector
} from "@siteimprove/alfa-dom";
import { Stream } from "@siteimprove/alfa-lang";

export const SIA_R9: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r9.html",
  requirements: [
    { id: "wcag:timing-adjustable", partial: true },
    { id: "wcag:interruptions", partial: true },
    { id: "wcag:change-on-request", partial: true }
  ],
  definition: (applicability, expectations, { document }) => {
    applicability(document, () => {
      const metaRefresh = querySelector<Element>(
        document,
        document,
        node => isElement(node) && isValidMetaRefresh(node, document)
      );

      return metaRefresh === null ? [] : [metaRefresh];
    });

    expectations((aspect, target, expectation) => {
      expectation(1, getRefreshTime(getAttribute(target, "content")!) === 0);
    });
  }
};

function isValidMetaRefresh(element: Element, context: Node): boolean {
  if (
    getElementNamespace(element, context) !== Namespace.HTML ||
    element.localName !== "meta" ||
    getAttribute(element, "http-equiv", { lowerCase: true }) !== "refresh"
  ) {
    return false;
  }

  const content = getAttribute(element, "content");

  if (content === null) {
    return false;
  }

  return getRefreshTime(content) !== null;
}

const whitespace = /\s/;
const digit = /\d/;

/**
 * @see https://www.w3.org/TR/html/document-metadata.html#statedef-http-equiv-refresh
 */
function getRefreshTime(content: string): number | null {
  const stream = new Stream(content.length, i => content[i]);

  stream.accept(char => whitespace.test(char));

  const time: Array<string> = [];

  if (!stream.accept(char => digit.test(char), time)) {
    return null;
  }

  const next = stream.peek(0);

  // As long as the time of the refresh is ended correctly, the URL won't matter
  // in terms of the validity of the refresh. If the URL is therefore invalid,
  // the refresh will simply redirect to the current page.
  if (next !== null && next !== ";" && next !== ",") {
    return null;
  }

  return parseInt(time.join(""), 10);
}
