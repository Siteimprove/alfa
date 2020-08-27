import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isIgnored } from "../predicate/is-ignored";
import { isPerceivable } from "../predicate/is-perceivable";

import { Question } from "../question";

const { isElement, hasName, hasNamespace } = Element;
const { filter, map } = Iterable;
const { and, not } = Predicate;

export function audio(
  document: Document,
  device: Device,
  options: audio.Options = {}
): Iterable<Interview<Question, Element, Option<Element>>> {
  return map(
    filter(
      document.descendants({ flattened: true, nested: true }),
      and(
        isElement,
        and(
          hasNamespace(Namespace.HTML),
          hasName("audio"),
          not(isIgnored(device))
        )
      )
    ),
    (element) =>
      Question.of(
        "is-audio-streaming",
        "boolean",
        element,
        `Is the \`<audio>\` element streaming?`
      ).map((isStreaming) =>
        isStreaming
          ? None
          : Question.of(
              "is-playing",
              "boolean",
              element,
              `Is the \`<audio>\` element currently playing?`
            ).map((isPlaying) =>
              isPlaying
                ? Option.of(element)
                : Question.of(
                    "play-button",
                    "node",
                    element,
                    `Where is the button that controls playback of the \`<audio>\`
                    element?`
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
