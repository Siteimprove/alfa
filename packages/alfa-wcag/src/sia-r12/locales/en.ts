import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Button has an accessible name",
  expectations: {
    1: {
      passed: data => "The button has an accessible name",
      failed: data => "The button must have an accessible name"
    }
  }
};
