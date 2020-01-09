import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r36.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, {
          audio: { has: true },
          track: { has: true, kind: "descriptions" }
        });
      },

      expectations(target) {
        return {
          1: Question.of(
            "track-describes-video",
            "boolean",
            target,
            `Does at least 1 track describe the visual information of the
            <video> element, either in the language of the <video> element or
            the language of the page?`
          ).map(trackDescribesVideo =>
            trackDescribesVideo
              ? Ok.of(
                  `The <video> element has a track that describes its visual
                  information in the language of the <video> element or the page`
                )
              : Err.of(
                  `The <video> element does not have a track that describes its
                  visual information in the language of the <video> element or
                  the page`
                )
          )
        };
      }
    };
  }
});
