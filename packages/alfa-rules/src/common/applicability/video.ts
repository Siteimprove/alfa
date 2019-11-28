import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "../predicate/has-name";
import { hasNamespace } from "../predicate/has-namespace";
import { isVisible } from "../predicate/is-visible";

import { Question } from "../question";
import { hasAttribute } from "../predicate/has-attribute";

const { filter, map, some } = Iterable;
const { and, equals } = Predicate;

export function video(
  document: Document,
  device: Device,
  options: video.Options = {}
): Iterable<Interview<Question, Element, Element | Option<Element>>> {
  const { audio, track } = options;

  return map(
    filter(
      document.descendants({ flattened: true, nested: true }),
      and(
        Element.isElement,
        and(
          hasNamespace(equals(Namespace.HTML)),
          and(
            hasName(equals("video")),
            and(
              isVisible(device),
              element =>
                track === undefined ||
                track.has ===
                  some(
                    element.children(),
                    and(
                      Element.isElement,
                      and(
                        hasName(equals("track")),
                        hasAttribute("kind", equals(track.kind))
                      )
                    )
                  )
            )
          )
        )
      )
    ),
    element =>
      Question.of(
        "is-streaming",
        "boolean",
        element,
        "Is the <video> element streaming?"
      ).map(isStreaming => {
        if (isStreaming) {
          return None;
        }

        if (audio !== undefined) {
          return Question.of(
            "has-audio",
            "boolean",
            element,
            "Does the <video> element have audio?"
          ).map(hasAudio =>
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
