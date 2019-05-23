import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Image has an accessible name",
  expectations: {
    1: {
      passed: data => "The image has an accessible name",
      failed: data => "The image must have an accessible name"
    }
  }
};
