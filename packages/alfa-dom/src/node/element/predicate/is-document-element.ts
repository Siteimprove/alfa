import { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.js";
import { Namespace } from "../../../namespace.js";

import { hasName } from "./has-name.js";
import { hasNamespace } from "./has-namespace.js";

const { and, test } = Refinement;

/**
 * @public
 */
export function isDocumentElement(
  isElement: Refinement<unknown, Element>,
): Refinement<unknown, Element<"html">> {
  return (value) =>
    test(
      and(isElement, and(hasName("html"), hasNamespace(Namespace.HTML))),
      value,
    );
}
