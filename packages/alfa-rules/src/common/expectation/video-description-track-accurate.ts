import { Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";

import { Question } from "../act/question";

import { expectation } from "../act/expectation";

export function videoDescriptionTrackAccurate(target: Element) {
  return {
    1: Question.of("track-describes-video", target).map((trackDescribesVideo) =>
      expectation(
        trackDescribesVideo,
        () => Outcomes.HasDescriptionTrack,
        () => Outcomes.HasNoDescriptionTrack
      )
    ),
  };
}

export namespace Outcomes {
  export const HasDescriptionTrack = Ok.of(
    Diagnostic.of(
      `The \`<video>\` element has a track that describes its visual information
    in the language of the \`<video>\` element or the page`
    )
  );

  export const HasNoDescriptionTrack = Err.of(
    Diagnostic.of(
      `The \`<video>\` element does not have a track that describes its visual
    information in the language of the \`<video>\` element or the page`
    )
  );
}
