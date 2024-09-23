import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import type { Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

const { hasName, isElement } = Element;
const { and } = Refinement;

/**
 * Check whether an `<option>` is hidden in its `<select>`.
 *
 * @privateRemarks
 * There is no official rule for which `<option>` is hidden inside a `<select>`,
 * and it gets tricky depending on the display size. This might be OS and UA
 * dependent.
 * From experiments on Chrome (quickly confirmed on Firefox) on Windows 11:
 * * If the `<select>` is not multiple and has display size of 1, then no
 *   `<option>` is actually shown. The `selected` (or first) `<option>` text is
 *   shown, but as the `<select>` value, not as an `<option>` (notably, it is
 *   styled through the `select` selector, not `option`).
 * * If the `<select>` is multiple, or has a display size of d>1, then d
 *   options are shown. They include the first `selected` option, and the previous
 *   ones, until d are found or the first is reached, and the following ones
 *   until d `<option>` are shown. If there are less than d `<option>`, this is
 *   completed with empty lines (styled as `select`, not as `option`).
 *
 * What is somewhat better, is that the boundingClientRect seem to be correctly
 * set. That is, in the first case above the `<option>` have a client rect of
 * `{ x:0, y:0, width:0, height:0 }`, while in the second case they have a non-0
 * one. The hidden `<option>` still have a non-0 client rect which is clipped
 * by the `<select>` client rect. So we can rely on that when layout information
 * is available.
 *
 * Note that styling the `<select>` to increase its `height` may break this
 * heuristic…
 *
 * @internal
 */
export function isOptionHidden(device: Device): Predicate<Element<"option">> {
  return function isHidden(option): boolean {
    const parent = namedParent(option, "select").orElse(() =>
      namedParent(option, "optgroup").flatMap(namedParent("select")),
    );

    for (const select of parent) {
      if (
        option.getBoundingBox(device).isSome() &&
        select.getBoundingBox(device).isSome()
      ) {
        // If we have both bounding boxes, we rely on `isClipped` to detect
        // whether the option is visible, so this considers it as not hidden.
        return false;
      }

      const displaySize = select.displaySize();
      const multiple = select.attribute("multiple").isSome();

      if (!multiple && displaySize === 1) {
        // First case above, all `<option>` are hidden.
        return true;
      }

      const options = select.optionsList();
      let firstSelectedIndex = -1;
      let optionIndex = -1;
      let idx = 0;
      for (const candidate of options) {
        if (candidate === option) {
          optionIndex = idx;
        }

        if (
          firstSelectedIndex === -1 &&
          candidate.attribute("selected").isSome()
        ) {
          firstSelectedIndex = idx;
        }

        if (firstSelectedIndex !== -1 && optionIndex !== -1) {
          break;
        }

        idx++;
      }

      /* WARNING! Indexes are 0-based, displaySize is 1-based. */

      if (firstSelectedIndex === -1 || firstSelectedIndex < displaySize) {
        // If no option is pre-selected;
        // or the first selected option is amongst the first d options;
        // then the first d options are shown, the rest are hidden.
        return optionIndex >= displaySize;
      } else {
        // the d options before (including) the first selected are shown.
        return (
          firstSelectedIndex - displaySize >= optionIndex ||
          optionIndex > firstSelectedIndex
        );
      }
    }

    // If there is no `<select>` controlling it, the `<option>` is shown.
    return false;
  };
}

function namedParent<N extends string>(
  element: Element,
  name: N,
): Option<Element<N>>;

function namedParent<N extends string>(
  name: N,
): (element: Element) => Option<Element<N>>;

function namedParent<N extends string>(
  elementOrName: Element | N,
  name?: N,
): Option<Element<N>> | ((element: Element) => Option<Element<N>>) {
  return isElement(elementOrName)
    ? elementOrName.parent().filter(and(isElement, hasName(name!)))
    : (element) =>
        element.parent().filter(and(isElement, hasName(elementOrName)));
}
