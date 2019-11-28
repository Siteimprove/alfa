import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "./has-name";
import { hasNamespace } from "./has-namespace";

const { and, equals } = Predicate;

export function isDocumentElement(): Predicate<Element> {
  return and(hasName(equals("html")), hasNamespace(equals(Namespace.HTML)));
}
