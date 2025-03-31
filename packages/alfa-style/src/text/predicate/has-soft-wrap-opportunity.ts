import { Device } from "@siteimprove/alfa-device";
import { Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";
import { String } from "@siteimprove/alfa-string";

import { hasComputedStyle } from "../../element/predicate/has-computed-style.js";

import { hasHyphenationOpportunity } from "./has-hyphenation-opportunity.js";

const { or } = Predicate;

/**
 * Test whether a Text node has soft wrap opportunities.
 *
 * @privateRemarks
 * For Western languages written in Latin script, only the "anywhere" values
 * change the behaviour. For other languages, notably CJK and South East Asian
 * languages, a finer analysis of the value of these properties and their
 * interaction would be needed.
 * For now, we assume this is sufficient for our main use cases, and will
 * revisit upon need.
 *
 * @public
 */
export function hasSoftWrapOpportunity(
  device: Device,
  context?: Context,
): Predicate<Text> {
  return or(
    // We start with the most likely to succeed.
    (text: Text) => String.hasSoftWrapOpportunity(text.data),
    hasHyphenationOpportunity(device, context),
    hasComputedStyle(
      "word-break",
      ({ value }) => value === "break-all",
      device,
      context,
    ),
    hasComputedStyle(
      "line-break",
      ({ value }) => value === "anywhere",
      device,
      context,
    ),
    hasComputedStyle(
      "overflow-wrap",
      ({ value }) => value === "break-word" || value === "anywhere",
      device,
      context,
    ),
  );
}
