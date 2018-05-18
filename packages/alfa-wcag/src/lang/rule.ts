import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  isElement,
  findAll,
  getAttribute
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";

export const Lang: Rule<Element, "document"> = {
  id: "alfa:wcag:lang",
  criteria: ["wcag:3.1.2"],
  locales: [],
  context: () => null,
  applicability: ({ document }) =>
    findAll<Element>(document, document, node => {
      if (!isElement(node) || node.localName === "html") {
        return false;
      }

      const lang = getAttribute(node, "lang", { trim: true });

      if (lang === null || lang === "") {
        return false;
      }

      const xmlLang = getAttribute(node, "xml:lang", { trim: true });

      return xmlLang === null || xmlLang === "";
    }),
  expectations: {
    1: (element, aspects, question) => {
      let lang = getAttribute(element, "lang", { trim: true });

      if (lang === null || lang === "") {
        lang = getAttribute(element, "xml:lang", { trim: true })!;
      }

      return getLanguage(lang) !== null;
    }
  }
};
