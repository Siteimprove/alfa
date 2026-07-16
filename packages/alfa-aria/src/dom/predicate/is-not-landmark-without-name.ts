import type { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasExplicitRole } from "./has-explicit-role.ts";
import { hasAccessibleName } from "./has-accessible-name.ts";

const { hasName } = Element;
const { and, not } = Predicate;

/**
 * `<form>` elements are not treated as landmarks if they do not have a name.
 *
 * @remarks
 * Since they still have a role of form (sort of, but Assistive Technologies
 * need to treat them as forms), we can't really handle that in the features,
 * and need a separate test.
 * {@link https://www.w3.org/TR/html-aam-1.0/#el-form}
 *
 * @public
 */
export function isNotLandmarkWithoutName(
  device: Device,
): Predicate<Element> {
  return and(
    hasName("form"),
    not(hasExplicitRole()),
    not(hasAccessibleName(device)),
  );
}
