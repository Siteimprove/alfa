import { Refinement } from "@siteimprove/alfa-refinement/src/refinement";

import { Element } from "../../element";
import { hasName } from "./has-name";

const { test } = Refinement;

// For some reason, type inference by "yarn document" seems to depend on
// machine (?) and returns the list of elements' names in different orders.
// This notably breaks the CI if "yarn document" their builds a different type
// than on local machine. Using a function with explicit type seems to stabilize
// things.

/**
 * {@link https://html.spec.whatwg.org/#replaced-elements}
 *
 * @public
 */
export function isReplaced(
  element: Element
): element is Element<
  "audio" | "canvas" | "embed" | "iframe" | "img" | "input" | "object" | "video"
> {
  return test(
    hasName(
      "audio",
      "canvas",
      "embed",
      "iframe",
      "img",
      "input",
      "object",
      "video"
    ),
    element
  );
}
