import { hasName } from "./has-name";

/**
 * {@link https://html.spec.whatwg.org/#replaced-elements}
 *
 * @public
 */
export const isReplaced = hasName<
  "audio" | "canvas" | "embed" | "iframe" | "img" | "input" | "object" | "video"
>("audio", "canvas", "embed", "iframe", "img", "input", "object", "video");
