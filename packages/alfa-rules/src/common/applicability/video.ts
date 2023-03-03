import { Interview } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence/src/sequence";
import { Style } from "@siteimprove/alfa-style";

import { Question } from "../act/question";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;
const { isVisible } = Style;

const visibleVideos = Cache.empty<Document, Cache<Device, Sequence<Element>>>();

export function video(
  document: Document,
  device: Device,
  options: video.Options
): Iterable<Interview<Question.Metadata, Element, Element, Option<Element>>> {
  const { audio, track } = options;

  const videos = visibleVideos
    .get(document, Cache.empty)
    .get(device, () =>
      document
        .elementDescendants(Node.fullTree)
        .filter(
          and(hasNamespace(Namespace.HTML), hasName("video"), isVisible(device))
        )
    );

  return (
    track === undefined
      ? videos
      : videos.filter(hasTrack(track.has, track.kind))
  ).map((element) =>
    Question.of("is-video-streaming", element).map((isStreaming) => {
      if (isStreaming) {
        return None;
      }

      return Question.of("has-audio", element).map((hasAudio) =>
        audio.has === hasAudio ? Option.of(element) : None
      );
    })
  );
}

function hasTrack(has: boolean, kind: string): Predicate<Element> {
  return (element) =>
    has ===
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
              .getOr("subtitles") === kind
        )
      );
}

export namespace video {
  export interface Options {
    audio: { has: boolean };
    track?: { has: boolean; kind: "descriptions" };
  }
}
