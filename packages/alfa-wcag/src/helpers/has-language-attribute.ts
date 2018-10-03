import { Element, getAttribute } from "@siteimprove/alfa-dom";

export function hasLanguageAttribute(element: Element): boolean {
  const lang = getAttribute(element, "lang", { trim: true });

  if (lang !== null && lang !== "") {
    return true;
  }

  const xmlLang = getAttribute(element, "xml:lang", { trim: true });

  return xmlLang !== null && lang !== "";
}
