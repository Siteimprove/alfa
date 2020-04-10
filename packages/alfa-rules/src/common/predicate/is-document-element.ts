import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "./has-name";
import { hasNamespace } from "./has-namespace";

const { and, equals } = Predicate;

export const isDocumentElement = and(
  Element.isElement,
  and(hasName(equals("html")), hasNamespace(equals(Namespace.HTML)))
);
