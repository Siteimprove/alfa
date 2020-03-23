import { Predicate } from "@siteimprove/alfa-predicate";

export const isWhitespace: Predicate<string> = (string) =>
  string.length > 0 && string.trim().length === 0;
