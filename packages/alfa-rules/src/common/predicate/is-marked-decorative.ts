import {Role} from "@siteimprove/alfa-aria";
import {Element} from "@siteimprove/alfa-dom";

/**
 * @see https://github.com/Siteimprove/sanshikan/blob/master/glossary/marked-as-decorative.md
 * Check if an element is marked as decorative by looking at its role but
 * without conflict resolution. If the result is "none" or "presentation", then
 * the element is marked as decorative.
 */
export function isMarkedDecorative(element: Element): boolean {
  return (
    Role.from(element, { allowPresentational: true })
      // Element is marked as decorative if at least one browser thinks so.
      .some((r) => r.some(Role.hasName("none", "presentation")))
  );
}
