import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../../element";
import { Namespace } from "../../../namespace";

import { hasName } from "./has-name";
import { hasNamespace } from "./has-namespace";

const { and, test } = Refinement;

/**
 * @public
 */
export function isDocumentElement(value: unknown): value is Element<"html"> {
  return test(
    and(Element.isElement, and(hasName("html"), hasNamespace(Namespace.HTML))),
    value
  );
}
