import { Interview } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import {
  contains,
  Document,
  Element,
  isElement,
  Namespace
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "../predicate/has-name";
import { hasNamespace } from "../predicate/has-namespace";
import { isVisible } from "../predicate/is-visible";

import { Question } from "../question";
import { walk } from "../walk";

const { filter, map } = Iterable;
const { and, equals } = Predicate;

export function video(
  document: Document,
  device: Device,
  options: video.Options = {}
): Iterable<Interview<Question, Element, Element | Option<Element>>> {
  const { audio, track } = options;

  return map(
    filter(
      walk(document, document, { flattened: true, nested: true }),
      and(
        isElement,
        and(
          hasNamespace(document, equals(Namespace.HTML)),
          and(
            hasName(equals("video")),
            and(
              isVisible(document, device),
              element =>
                track === undefined ||
                track.has ===
                  contains(element, document, `track[kind="${track.kind}"]`)
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
