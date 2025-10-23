import { Diagnostic } from "@siteimprove/alfa-act";
import type { Device } from "@siteimprove/alfa-device";
import type { Node } from "@siteimprove/alfa-dom";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";

import type * as act from "@siteimprove/alfa-act";

import { expectation } from "../act/expectation.js";
import { Question } from "../act/question.js";

const { isElement } = Element;
const { and } = Refinement;

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
  kind: "<audio>" | "<video>",
  transcriptCheck: Predicate<Element>,
) {
  return {
    1: transcript.map((transcript) => {
      if (transcript.isNone()) {
        return transcriptLink.map((transcriptLink) => {
          if (transcriptLink.isNone()) {
            return Option.of(Outcomes.HasNoTranscriptLink(kind));
          }

          if (transcriptLink.filter(and(isElement, transcriptCheck)).isNone()) {
            return Option.of(Outcomes.HasNonPerceivableLink(kind));
          }

          return Option.of(Outcomes.HasPerceivableLink(kind));
        });
      }

      return expectation(
        transcript.some(and(isElement, transcriptCheck)),
        () => Outcomes.HasPerceivableTranscript(kind),
        () => Outcomes.HasNonPerceivableTranscript(kind),
      );
    }),
  };
}

export function audioTranscript(
  target: Element,
  transcriptCheck: Predicate<Element>,
) {
  const alt = Question.of(
    "transcript",
    target,
    `Where is the transcript that describes the content of the \`<audio>\` element?`,
  );

  const label = Question.of(
    "transcript-link",
    target,
    `Where is the link pointing to a perceivable transcript that describes the content of the \`<audio>\` element?`,
  );

  return mediaTranscript(alt, label, "<audio>", transcriptCheck);
}

export function videoTranscript(
  target: Element,
  transcriptCheck: Predicate<Element>,
) {
  const alt = Question.of(
    "transcript",
    target,
    `Where is the transcript that describes the content of the \`<video>\` element?`,
  );

  const label = Question.of(
    "transcript-link",
    target,
    `Where is the link pointing to a perceivable transcript that describes the content of the \`<video>\` element?`,
  );

  return mediaTranscript(alt, label, "<video>", transcriptCheck);
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasPerceivableTranscript = (kind: "<audio>" | "<video>") =>
    Ok.of(
      Diagnostic.of(
        `The \`${kind}\` element has a transcript that is perceivable`,
      ),
    );

  export const HasPerceivableLink = (kind: "<audio>" | "<video>") =>
    Ok.of(
      Diagnostic.of(`The \`${kind}\` element has a link that is perceivable`),
    );

  export const HasNoTranscriptLink = (kind: "<audio>" | "<video>") =>
    Err.of(Diagnostic.of(`The \`${kind}\` element does not have a transcript`));

  export const HasNonPerceivableLink = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` has a link to transcript, but the link is not perceivable`,
      ),
    );

  export const HasNonPerceivableTranscript = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` element has a transcript that is not perceivable`,
      ),
    );
}
