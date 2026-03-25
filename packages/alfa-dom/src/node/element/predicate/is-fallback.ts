import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../element.js";
import type { Node } from "../../../node.js";

import { hasName } from "./has-name.js";

const { not, or } = Predicate;
const { and } = Refinement;

/**
 * Children of <iframe>, <audio>, <video> elements act as fallback content in
 * legacy user agents.
 *
 * <track> and <source> children of audio and video are allowed by the content
 * model of both. Thus, they will be not act as fallback
 *
 * {@link https://html.spec.whatwg.org/multipage/#the-video-element}
 * {@link https://html.spec.whatwg.org/multipage/#the-audio-element}
 *
 * @public
 */
export function isFallback(
  isElement: Refinement<unknown, Element>,
): Predicate<Node> {
  return or(
    hasParentName(isElement, "iframe"),
    and(
      hasParentName(isElement, "audio", "video"),
      not(and(isElement, hasName("track", "source"))),
    ),
  );
}

function hasParentName(
  isElement: Refinement<unknown, Element>,
  name: string,
  ...names: Array<string>
): Predicate<Node> {
  return (node) =>
    node
      .parent()
      .filter(isElement)
      .some(hasName(name, ...names));
}
