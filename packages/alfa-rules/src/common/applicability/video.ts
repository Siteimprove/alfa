import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { Question } from "../act/question";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;
const { isVisible } = Style;

export function video(
  document: Document,
  device: Device,
  options: video.Options = {}
): Iterable<Interview<Question.Metadata, Element, Element, Option<Element>>> {
  const { audio, track } = options;

  return document
    .elementDescendants(Node.fullTree)
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
                      .map((kind) =>
                        kind
                          .enumerate(
                            "subtitles",
                            "captions",
                            "descriptions",
                            "chapters",
                            "metadata"
                          )
                          // invalid value default
                          .getOr("metadata")
                      )
                      // missing value default
                      .getOr("subtitles") === track.kind
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
