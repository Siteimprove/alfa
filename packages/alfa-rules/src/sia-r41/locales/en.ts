import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Links with identical accessible names serve equivalent purpose",
  expectations: {
    1: {
      passed: data =>
        "The links have matching accessible names and resolve to the same or equivalent resources",
      failed: data =>
        "The links have matching accessible names but do not resolve to the same or equivalent resources"
    }
  },
  questions: {
    "embed-equivalent-resources":
      "Do the links resolve to the same or equivalent resources?"
  }
};
