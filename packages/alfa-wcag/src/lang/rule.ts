import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  getAttribute,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";

export const Lang: Rule<"document", Element> = {
  id: "alfa:wcag:lang",
  definition: (applicability, expectations, { document }) => {
    applicability(
      () =>
        querySelectorAll(document, document, node => {
          if (!isElement(node) || node.localName === "html") {
            return false;
          }

          const lang = getAttribute(node, "lang", { trim: true });

          if (lang === null || lang === "") {
            return false;
          }

          const xmlLang = getAttribute(node, "xml:lang", { trim: true });

          return xmlLang === null || xmlLang === "";
        }) as Array<Element>
    );

    expectations((target, expectation) => {
      let lang = getAttribute(target, "lang", { trim: true });

      if (lang === null || lang === "") {
        lang = getAttribute(target, "xml:lang", { trim: true })!;
      }

      expectation(1, getLanguage(lang) !== null);
    });
  }
};
