import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Document has a title",
  expectations: {
    1: {
      passed: data => "The document has at least one `<title>` element",
      failed: data => "The document must have at least one `<title>` element"
    },
    2: {
      passed: data => "The first `<title>` element has textual content",
      failed: data => "The first `<title>` element must have textual content"
    }
  }
};
