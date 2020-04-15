import { Element, hasName } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasRole } from "./has-role";

export const isDecorative: Predicate<Element> = hasRole("presentation", "none");
