import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isPerceivable, isRendered } from "../predicate";

import { Question } from "../act/question";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export function audio(
  document: Document,
  device: Device,
  options: audio.Options = {}
): Iterable<Interview<Question.Metadata, Element, Element, Option<Element>>> {
  return document
    .descendants({ flattened: true, nested: true })
    .filter(isElement)
    .filter(
      // Non-rendered <audio> are not playing
      and(hasNamespace(Namespace.HTML), hasName("audio"), isRendered(device))
    )
    .map((element) =>
      Question.of("is-audio-streaming", element).map((isStreaming) =>
        isStreaming
          ? None
          : Question.of("is-playing", element).map((isPlaying) =>
              isPlaying
                ? Option.of(element)
                : Question.of("play-button", element).map((playButton) =>
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
