import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Question } from "../question";
import { expectation } from "../expectation";

export function videoDescriptionTrackAccurate(target: Element) {
  return {
    1: Question.of(
      "track-describes-video",
      "boolean",
      target,
      `Does at least 1 track describe the visual information of the
            <video> element, either in the language of the <video> element or
            the language of the page?`
    ).map(trackDescribesVideo =>
      expectation(
        trackDescribesVideo,
        Outcomes.HasDescriptionTrack,
        Outcomes.HasNoDescriptionTrack
      )
    )
  };
}

export namespace Outcomes {
  export const HasDescriptionTrack = Ok.of(
    `The <video> element has a track that describes its visual
                  information in the language of the <video> element or the page`
  );

  export const HasNoDescriptionTrack = Err.of(
    `The <video> element does not have a track that describes its
                  visual information in the language of the <video> element or
                  the page`
  );
}
