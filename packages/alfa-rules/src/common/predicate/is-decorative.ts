import { Element, hasName } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasRole } from "./has-role";

const { equals } = Predicate;

export const isDecorative: Predicate<Element> = hasRole(
  hasName(equals("presentation", "none"))
);
