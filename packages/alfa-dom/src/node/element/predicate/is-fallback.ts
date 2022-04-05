import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../../element";
import { Node } from "../../../node";

import { hasName } from "./has-name";

const { not, or, test } = Predicate;
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
export function isFallback(node: Node): boolean {
  return test(
    or(
      hasParentName("iframe"),
      and(
        hasParentName("audio", "video"),
        not(and(Element.isElement, hasName("track", "source")))
      )
    ),
    node
  );
}

function hasParentName(name: string, ...names: Array<string>): Predicate<Node> {
  return (node) =>
    node
      .parent()
      .filter(Element.isElement)
      .some(hasName(name, ...names));
}
