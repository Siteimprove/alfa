import { Interview } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  Node,
  Query,
} from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { Question } from "../act/question.js";

const { isPerceivableForAll } = DOM;
const { isElement, hasName, hasNamespace, hasAttribute } = Element;
const { and } = Predicate;
const { isRendered } = Style;
const { getElementDescendants } = Query;

const cache = Cache.empty<
  Document,
  Cache<
    Device,
    Sequence<Interview<Question.Metadata, Element, Element, Option<Element>>>
  >
>();

export function audio(
  document: Document,
  device: Device,
): Sequence<Interview<Question.Metadata, Element, Element, Option<Element>>> {
  return cache.get(document, Cache.empty).get(device, () =>
    getElementDescendants(document, Node.fullTree)
      .filter(
        // Non-rendered <audio> are not playing
        and(hasNamespace(Namespace.HTML), hasName("audio"), isRendered(device)),
      )
      .map((element) =>
        Question.of("is-audio-streaming", element).map((isStreaming) =>
          isStreaming
            ? None
            : Question.of("is-playing", element)
                .answerIf(hasAttribute("autoplay"), true)
                .map((isPlaying) =>
                  isPlaying
                    ? Option.of(element)
                    : Question.of("play-button", element)
                        .answerIf(hasAttribute("controls"), Option.of(element))
                        .map((playButton) =>
                          playButton.some(
                            and(isElement, isPerceivableForAll(device)),
                          )
                            ? Option.of(element)
                            : None,
                        ),
                ),
        ),
      ),
  );
}
