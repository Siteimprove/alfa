import { Diagnostic } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";

import { expectation } from "../act/expectation.js";
import { Question } from "../act/question.js";

export function videoDescriptionTrackAccurate(target: Element) {
  return {
    1: Question.of("track-describes-video", target).map((trackDescribesVideo) =>
      expectation(
        trackDescribesVideo,
        () => Outcomes.HasDescriptionTrack,
        () => Outcomes.HasNoDescriptionTrack,
      ),
    ),
  };
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasDescriptionTrack = Ok.of(
    Diagnostic.of(
      `The \`<video>\` element has a track that describes its visual information
    in the language of the \`<video>\` element or the page`,
    ),
  );

  export const HasNoDescriptionTrack = Err.of(
    Diagnostic.of(
      `The \`<video>\` element does not have a track that describes its visual
    information in the language of the \`<video>\` element or the page`,
    ),
  );
}
