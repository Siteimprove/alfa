import { Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";

import * as act from "@siteimprove/alfa-act";

import { expectation } from "../act/expectation";
import { Question } from "../act/question";

import { isPerceivableForAll } from "../../../../alfa-aria/src/dom/predicate/is-perceivable";

const { isElement } = Element;
const { and } = Predicate;

function mediaTranscript(
  transcript: act.Question<
    "node",
    Element,
    Element,
    Option<Node>,
    Option<Node>,
    "transcript"
  >,
  transcriptLink: act.Question<
    "node",
    Element,
    Element,
    Option<Node>,
    Option<Node>,
    "transcript-link"
  >,
  device: Device,
  kind: "<audio>" | "<video>"
) {
  return {
    1: transcript.map((transcript) => {
      if (transcript.isNone()) {
        return transcriptLink.map((transcriptLink) => {
          if (transcriptLink.isNone()) {
            return Option.of(Outcomes.HasNoTranscriptLink(kind));
          }

          if (
            transcriptLink
              .filter(and(isElement, isPerceivableForAll(device)))
              .isNone()
          ) {
            return Option.of(Outcomes.HasNonPerceivableLink(kind));
          }

          return Option.of(Outcomes.HasPerceivableLink(kind));
        });
      }

      return expectation(
        transcript.some(and(isElement, isPerceivableForAll(device))),
        () => Outcomes.HasPerceivableTranscript(kind),
        () => Outcomes.HasNonPerceivableTranscript(kind)
      );
    }),
  };
}

export function audioTranscript(target: Element, device: Device) {
  const alt = Question.of(
    "transcript",
    target,
    `Where is the transcript of the \`<audio>\` element?`
  );

  const label = Question.of(
    "transcript-link",
    target,
    `Where is the link pointing to a perceivable transcript of the \`<audio>\` element?`
  );

  return mediaTranscript(alt, label, device, "<audio>");
}

export function videoTranscript(target: Element, device: Device) {
  const alt = Question.of(
    "transcript",
    target,
    `Where is the transcript of the \`<video>\` element?`
  );

  const label = Question.of(
    "transcript-link",
    target,
    `Where is the link pointing to a perceivable transcript of the \`<video>\` element?`
  );

  return mediaTranscript(alt, label, device, "<video>");
}

export namespace Outcomes {
  export const HasPerceivableTranscript = (kind: "<audio>" | "<video>") =>
    Ok.of(
      Diagnostic.of(
        `The \`${kind}\` element has a transcript that is perceivable`
      )
    );

  export const HasPerceivableLink = (kind: "<audio>" | "<video>") =>
    Ok.of(
      Diagnostic.of(`The \`${kind}\` element has a link that is perceivable`)
    );

  export const HasNoTranscriptLink = (kind: "<audio>" | "<video>") =>
    Err.of(Diagnostic.of(`The \`${kind}\` element does not have a transcript`));

  export const HasNonPerceivableLink = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` has a link to transcript, but the link is not perceivable`
      )
    );

  export const HasNonPerceivableTranscript = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` element has a transcript that is not perceivable`
      )
    );
}
