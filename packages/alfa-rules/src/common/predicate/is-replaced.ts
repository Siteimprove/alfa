import { Element } from "@siteimprove/alfa-dom";

/**
 * {@link https://html.spec.whatwg.org/#replaced-elements}
 */
export const isReplaced = Element.hasName(
  "audio",
  "canvas",
  "embed",
  "iframe",
  "img",
  "input",
  "object",
  "video"
);
