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
    "wcag:timing-adjustable",
    "wcag:interruptions",
    "wcag:change-on-request"
  ],
  definition: (applicability, expectations, { document }) => {
    applicability(() => {
      const metaRefresh = querySelector<Element>(
        document,
        document,
        node => isElement(node) && isValidMetaRefresh(node, document)
      );

      return metaRefresh === null ? [] : [metaRefresh];
    });

    expectations((target, expectation) => {
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

/**
 * @see https://www.w3.org/TR/html/document-metadata.html#statedef-http-equiv-refresh
 */
function getRefreshTime(content: string): number | null {
  const stream = new Stream(content.length, i => content[i]);

  stream.accept(char => /\s/.test(char));

  const time: Array<string> = [];

  if (!stream.accept(char => /\d/.test(char), time)) {
    return null;
  }

  const next = stream.peek(0);

  // As long as the time of the refresh is ended correctly, the URL won't matter
  // in terms of the validity of the refresh. If the URL is therefore invalid,
  // the refresh will simply redirect to the current page.
  if (next !== null && next !== ";" && next !== "," && /\s/.test(next)) {
    return null;
  }

  return parseInt(time.join(""), 10);
}
