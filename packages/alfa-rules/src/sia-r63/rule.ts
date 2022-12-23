import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasNonEmptyAccessibleName, isIncludedInTheAccessibilityTree } = DOM;
const { isElement, hasAttribute, hasName, hasNamespace } = Element;
const { and, or } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r63",
  requirements: [Criterion.of("1.1.1")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants(Node.fullTree)
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("object"),
              isIncludedInTheAccessibilityTree(device),
              embedsMedia
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = Ok.of(
    Diagnostic.of(`The \`<object>\` element has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The \`<object>\` element does not have an accessible name`)
  );
}

function embedsMedia(element: Element): boolean {
  return element
    .attribute("type")
    .map((type) => MediaMIMEType.includes(type.value.split("/")[0]))
    .getOrElse(() =>
      element
        .attribute("data")
        .some((data) =>
          MediaFileExtension.includes(data.value.split(".").splice(-1)[0])
        )
    );
}

/**
 * {@see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types}
 * {@see https://www.iana.org/assignments/media-types/media-types.xhtml}
 * We restrict ourselves to common types, but will expand the list if needed.
 */
const MediaMIMEType = ["audio", "image", "video"];
const MediaFileExtension = [
  "aac",
  "avif",
  "avi",
  "bmp",
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "mid",
  "midi",
  "mp3",
  "mp4",
  "mpeg",
  "oga",
  "ogv",
  "opus",
  "png",
  "svg",
  "tif",
  "tiff",
  "ts",
  "wav",
  "weba",
  "webm",
  "webp",
  "3gp",
  "3GPP",
  "3g2",
  "3GPP2",
];
