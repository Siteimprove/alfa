import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  getAttribute,
  isElement,
  querySelector
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";

export const HtmlXmlLangMatch: Rule<"document", Element> = {
  id: "alfa:wcag:html-xml-lang-match",
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelector<Element>(document, document, node => {
        if (!isElement(node) || node.localName !== "html") {
          return false;
        }

        const lang = getAttribute(node, "lang", { trim: true });
        const xmlLang = getAttribute(node, "xml:lang", { trim: true });

        return (
          lang !== null && lang !== "" && xmlLang !== null && xmlLang !== ""
        );
      })
    );

    expectations((target, expectation) => {
      const lang = getLanguage(getAttribute(target, "lang", { trim: true })!);
      const xmlLang = getLanguage(
        getAttribute(target, "xml:lang", { trim: true })!
      );

      expectation(
        1,
        lang !== null && xmlLang !== null && lang.primary === xmlLang.primary
      );
    });
  }
};
