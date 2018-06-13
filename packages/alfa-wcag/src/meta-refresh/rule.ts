import { Stream } from "@siteimprove/alfa-lang";
import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement, find, getAttribute } from "@siteimprove/alfa-dom";

export const MetaRefresh: Rule<"document", Element> = {
  id: "alfa:wcag:meta-refresh",
  criteria: ["wcag:2.2.1", "wcag:3.2.5"],
  locales: [],
  context: () => null,
  applicability: ({ document }) =>
    find<Element>(document, document, node => {
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
    }),
  expectations: {
    1: (element, aspects, question) => {
      return getRefreshTime(getAttribute(element, "content")!) === 0;
    }
  }
};

/**
 * @see https://www.w3.org/TR/html/document-metadata.html#statedef-http-equiv-refresh
 */
function getRefreshTime(content: string): number | null {
  const stream = new Stream(content.length, i => content[i]);

  stream.accept(char => /\s/.test(char));

  const time = stream.accept(char => /\d/.test(char));

  if (time === false) {
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
