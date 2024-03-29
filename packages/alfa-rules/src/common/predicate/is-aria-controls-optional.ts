import { Node } from "@siteimprove/alfa-aria";
import { Predicate } from "@siteimprove/alfa-predicate";

const { hasAttribute, hasRole } = Node;
const { and } = Predicate;

/**
 * `aria-controls` is marked as required on `combobox` in ARIA 1.2, not in ARIA
 * 1.3. Additionally, the authoring practice essentially only consider it
 * when the combobox is expanded.
 * {@link https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#wai-ariaroles,states,andproperties}
 *
 * We rely on `aria-expanded` being set correctly to detect the need.
 *
 * @internal
 */
export const isAriaControlsOptional = and(
  hasRole("combobox"),
  hasAttribute("aria-expanded", (expanded) => expanded !== "true"),
);
