import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement, find, getAttribute } from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";

export const HtmlXmlLangMatch: Rule<Element, "document"> = {
  id: "alfa:wcag:html-xml-lang-match",
  criteria: ["wcag:3.1.1"],
  locales: [],
  context: () => null,
  applicability: ({ document }) =>
    find<Element>(document, document, node => {
      if (!isElement(node) || node.localName !== "html") {
        return false;
      }

      const lang = getAttribute(node, "lang", { trim: true });
      const xmlLang = getAttribute(node, "xml:lang", { trim: true });

      return lang !== null && lang !== "" && xmlLang !== null && xmlLang !== "";
    }),
  expectations: {
    1: (element, aspects, question) => {
      const lang = getLanguage(getAttribute(element, "lang", { trim: true })!);
      const xmlLang = getLanguage(
        getAttribute(element, "xml:lang", { trim: true })!
      );

      if (lang === null || xmlLang === null) {
        return false;
      }

      return lang.primary === xmlLang.primary;
    }
  }
};
