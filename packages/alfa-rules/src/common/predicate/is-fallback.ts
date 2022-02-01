import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

const { not, or } = Predicate;
const { and } = Refinement;
const { isElement, hasName } = Element;

/**
 * {@link https://html.spec.whatwg.org/multipage/#the-video-element}
 * {@link https://html.spec.whatwg.org/multipage/#the-audio-element}
 */

// Children of <iframe>, <audio>, <video> elements act as fallback content in legacy user
// agents.

export const isFallback = or(
  hasParentName("iframe"),
  and(
    // <track> and <source> children of audio and video are allowed by the content model of
    // both. Thus, they will be not act as fallback
    hasParentName("audio", "video"),
    not(and(isElement, hasName("track", "source")))
  )
);

function hasParentName(name: string, ...names: Array<string>): Predicate<Node> {
  return (node) =>
    node
      .parent()
      .filter(isElement)
      .some(hasName(name, ...names));
}
