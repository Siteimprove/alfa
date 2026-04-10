import { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.ts";
import { Namespace } from "../../../namespace.ts";

import { hasName } from "./has-name.ts";
import { hasNamespace } from "./has-namespace.ts";

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
