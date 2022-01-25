import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

const { not, or } = Predicate;
const { and } = Refinement;
const { isElement, hasName } = Element;

// https://html.spec.whatwg.org/multipage/#the-video-element
// https://html.spec.whatwg.org/multipage/#the-audio-element

// Children of <iframe>, <audio>, <video> elements act as fallback content in legacy user
// agents and should therefore never be considered rendered.
/**
 * 
 */
export const isFallback = or(
  hasParentName("iframe"),
  and(
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
