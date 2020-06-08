import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Err, Ok } from "@siteimprove/alfa-result";

import * as act from "@siteimprove/alfa-act";

import { expectation } from "../expectation";

import { isPerceivable } from "../predicate/is-perceivable";

import { Question } from "../question";
import { Diagnostic } from "@siteimprove/alfa-act";

function mediaTextAlternative(
  alt: act.Question<"node", Option<Node>, Element>,
  label: act.Question<"node", Option<Node>, Element>,
  device: Device,
  kind: "<audio>" | "<video>"
) {
  return {
    1: alt.map((alt) =>
      expectation(
        alt.isSome(),
        () =>
          expectation(
            alt.some(isPerceivable(device)),
            () => Outcomes.HasPerceivableAlternative(kind),
            () => Outcomes.HasNonPerceivableAlternative(kind)
          ),
        () => Outcomes.HasNoAlternative(kind)
      )
    ),
    2: label.map((label) =>
      expectation(
        label.isSome(),
        () =>
          expectation(
            label.some(isPerceivable(device)),
            () => Outcomes.HasPerceivableLabel(kind),
            () => Outcomes.HasNonPerceivableLabel(kind)
          ),
        () => Outcomes.HasNoLabel(kind)
      )
    ),
  };
}

// keeping the next two functions separate because question should be split in two at some point.
export function audioTextAlternative(target: Element, device: Device) {
  const alt = Question.of(
    "text-alternative",
    "node",
    target,
    `Where is the text alternative of the \`<audio>\` element?`
  );

  const label = Question.of(
    "label",
    "node",
    target,
    `Where is the text that labels the \`<audio>\` element as a video alternative?`
  );

  return mediaTextAlternative(alt, label, device, "<video>");
}

export function videoTextAlternative(target: Element, device: Device) {
  const alt = Question.of(
    "text-alternative",
    "node",
    target,
    `Where is the text alternative of the \`<video>\` element?`
  );

  const label = Question.of(
    "label",
    "node",
    target,
    `Where is the text that labels the \`<video>\` element as a video alternative?`
  );

  return mediaTextAlternative(alt, label, device, "<video>");
}

export namespace Outcomes {
  export const HasPerceivableAlternative = (kind: "<audio>" | "<video>") =>
    Ok.of(
      Diagnostic.of(
        `The \`${kind}\` element has a text alternative that is perceivable`
      )
    );

  export const HasNonPerceivableAlternative = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` element has a text alternative that is not perceivable`
      )
    );

  export const HasNoAlternative = (kind: "<audio>" | "<video>") =>
    Err.of(Diagnostic.of(`The \`${kind}\` element has no text alternative`));

  export const HasPerceivableLabel = (kind: "<audio>" | "<video>") =>
    Ok.of(
      Diagnostic.of(
        `The \`${kind}\` element is labelled as a video alternative and the label is perceivable`
      )
    );

  export const HasNonPerceivableLabel = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` element is labelled as a video alternative, but the label is not perceivable`
      )
    );

  export const HasNoLabel = (kind: "<audio>" | "<video>") =>
    Err.of(
      Diagnostic.of(
        `The \`${kind}\` element is not labelled as a video alternative`
      )
    );
}
