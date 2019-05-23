import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "ARIA state or property has a valid value",
  expectations: {
    1: {
      passed: data => "The attribute has a valid value",
      failed: data => "The attribute does not have a valid value"
    }
  }
};
