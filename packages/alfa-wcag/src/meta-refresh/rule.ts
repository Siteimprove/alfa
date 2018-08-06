import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  getAttribute,
  isElement,
  querySelector
} from "@siteimprove/alfa-dom";
import { Stream } from "@siteimprove/alfa-lang";

export const MetaRefresh: Rule<"document", Element> = {
  id: "alfa:wcag:meta-refresh",
  definition: (applicability, expectations, { document }) => {
    applicability(
      () =>
        querySelector(document, document, node => {
          if (
            !isElement(node) ||
            node.localName !== "meta" ||
            getAttribute(node, "http-equiv", { lowerCase: true }) !== "refresh"
          ) {
            return false;
          }

          const content = getAttribute(node, "content");

          if (content === null) {
            return false;
          }

          return getRefreshTime(content) !== null;
        }) as Element | null
    );

    expectations((target, expectation) => {
      expectation(1, getRefreshTime(getAttribute(target, "content")!) === 0);
    });
  }
};

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
