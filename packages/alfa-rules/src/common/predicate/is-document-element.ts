import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "./has-name";
import { hasNamespace } from "./has-namespace";

const { and } = Predicate;

export const isDocumentElement = and(
  Element.isElement,
  and(hasName("html"), hasNamespace(Namespace.HTML))
);
