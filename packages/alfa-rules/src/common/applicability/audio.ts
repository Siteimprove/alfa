import { Interview } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { Question } from "../act/question";

const { isPerceivableForAll } = DOM;
const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;
const { isRendered } = Style;

export function audio(
  document: Document,
  device: Device,
  options: audio.Options = {}
): Iterable<Interview<Question.Metadata, Element, Element, Option<Element>>> {
  return document
    .descendants(Node.fullTree)
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
                    playButton.some(and(isElement, isPerceivableForAll(device)))
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
