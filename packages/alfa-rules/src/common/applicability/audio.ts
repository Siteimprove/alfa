import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isIgnored } from "../predicate/is-ignored";
import { isPerceivable } from "../predicate/is-perceivable";

import { Question } from "../question";

const { isElement, hasName, hasNamespace } = Element;
const { and, not } = Predicate;

export function audio(
  document: Document,
  device: Device,
  options: audio.Options = {}
): Iterable<Interview<Question, Element, Element, Option<Element>>> {
  return document
    .descendants({ flattened: true, nested: true })
    .filter(isElement)
    .filter(
      and(
        hasNamespace(Namespace.HTML),
        hasName("audio"),
        not(isIgnored(device))
      )
    )
    .map((element) =>
      Question.of(
        "boolean",
        "is-audio-streaming",
        `Is the \`<audio>\` element streaming?`,
        element
      ).map((isStreaming) =>
        isStreaming
          ? None
          : Question.of(
              "boolean",
              "is-playing",
              `Is the \`<audio>\` element currently playing?`,
              element
            ).map((isPlaying) =>
              isPlaying
                ? Option.of(element)
                : Question.of(
                    "node",
                    "play-button",
                    `Where is the button that controls playback of the \`<audio>\`
                    element?`,
                    element
                  ).map((playButton) =>
                    playButton.some(
                      and(Element.isElement, isPerceivable(device))
                    )
                      ? Option.of(element)
                      : None
                  )
            )
      )
    );
}

export namespace audio {
  export interface Options {}
}
