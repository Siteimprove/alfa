import { Predicate } from "@siteimprove/alfa-predicate";

import { isEmpty } from "./is-empty";

export const isWhitespace: Predicate<string> = string =>
  string.length > 0 && isEmpty(string.trim());
