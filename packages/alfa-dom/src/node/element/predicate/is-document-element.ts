import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../../element.js";
import { Namespace } from "../../../namespace.js";

import { hasName } from "./has-name.js";
import { hasNamespace } from "./has-namespace.js";

const { and, test } = Refinement;

/**
 * @public
 */
export function isDocumentElement(value: unknown): value is Element<"html"> {
  return test(
    and(Element.isElement, and(hasName("html"), hasNamespace(Namespace.HTML))),
    value,
  );
}
