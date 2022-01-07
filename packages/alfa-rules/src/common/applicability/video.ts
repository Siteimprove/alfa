import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isVisible } from "../predicate/is-visible";

import { Question } from "../question";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export function video(
  document: Document,
  device: Device,
  options: video.Options = {}
): Iterable<Interview<Question, Element, Element, Option<Element>>> {
  const { audio, track } = options;

  return document
    .descendants({ flattened: true, nested: true })
    .filter(isElement)
    .filter(
      and(
        hasNamespace(Namespace.HTML),
        hasName("video"),
        isVisible(device),
        (element) =>
          track === undefined ||
          track.has ===
            element
              .children()
              .filter(isElement)
              .some(
                and(
                  hasName("track"),
                  (trackElement) =>
                    trackElement
                      .attribute("kind")
                      // {@link https://html.spec.whatwg.org/multipage/media.html#attr-track-kind}
                      .map(
                        (kind) =>
                          kind
                            .enumerate(
                              "subtitles",
                              "captions",
                              "descriptions",
                              "chapters",
                              "metadata"
                            )
                            .getOr("metadata") // invalid value default
                      )
                      .getOr("subtitles") === track.kind // missing value default
                )
              )
      )
    )
    .map((element) =>
      Question.of("is-video-streaming", element).map((isStreaming) => {
        if (isStreaming) {
          return None;
        }

        if (audio !== undefined) {
          return Question.of("has-audio", element).map((hasAudio) =>
            audio.has === hasAudio ? Option.of(element) : None
          );
        }

        return Option.of(element);
      })
    );
}

export namespace video {
  export interface Options {
    audio?: { has: boolean };
    track?: { has: boolean; kind: "descriptions" };
  }
}
