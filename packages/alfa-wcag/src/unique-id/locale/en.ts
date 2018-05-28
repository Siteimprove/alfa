import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Element IDs must be unique",
  description:
    "This rule checks that all `id` attribute values on a single page are unique.",
  applicability: "Any element with an id attribute.",
  expectations: {
    "1": {
      description: "All `id` attribute values are unique.",
      outcome: {
        passed: "The element has a unique ID",
        failed: "The element has non-unique ID"
      }
    }
  }
};
