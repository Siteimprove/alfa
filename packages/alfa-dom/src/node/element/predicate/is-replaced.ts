import { hasName } from "./has-name";

/**
 * {@link https://html.spec.whatwg.org/#replaced-elements}
 */
export const isReplaced = hasName(
  "audio",
  "canvas",
  "embed",
  "iframe",
  "img",
  "input",
  "object",
  "video"
);
