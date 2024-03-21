import { Predicate } from "@siteimprove/alfa-predicate";
import { Element } from "@siteimprove/alfa-dom";

/**
 * {@link https://github.com/Siteimprove/sanshikan/blob/main/terms/user-agent-controlled.md}
 *
 * @privateRemarks
 * This predicate is work-in-progress and does not currently fully capture the defintion of user-agent controlled elements.
 * It will for instance falsly identify input elements modified by the author as user-agent controlled.
 */
export function isUserAgentControlled(): Predicate<Element> {
  return (element) => element.name === "input";
}
