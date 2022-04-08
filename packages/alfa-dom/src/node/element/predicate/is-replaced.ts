import { Refinement } from "@siteimprove/alfa-refinement/src/refinement";
import { Element } from "../../element";
import { hasName } from "./has-name";

/**
 * {@link https://html.spec.whatwg.org/#replaced-elements}
 *
 * @public
 */
export const isReplaced: Refinement<
  Element,
  Element<
    | "audio"
    | "canvas"
    | "embed"
    | "iframe"
    | "img"
    | "input"
    | "object"
    | "video"
  >
> = hasName(
  "audio",
  "canvas",
  "embed",
  "iframe",
  "img",
  "input",
  "object",
  "video"
);
