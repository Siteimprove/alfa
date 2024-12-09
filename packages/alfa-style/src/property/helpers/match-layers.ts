import { List, type Value } from "@siteimprove/alfa-css";

import type { Style } from "../../style.js";

/**
 * {@link https://drafts.fxtf.org/css-masking/#layering}.
 *
 * @remarks
 * The computed value depends on the number of layers.
 * A layer is created for each of the comma separated values for `mask-image`.
 *
 * If there are more values than layers, the excess values are discarded.
 * Otherwise, the values must be repeated
 * until the number of values matches the number of layers.
 */
export function matchLayers<V extends Value>(
  value: List<V>,
  style: Style,
): List<V> {
  const numberOfLayers = Math.max(
    style.computed("mask-image").value.values.length,
    1,
  );

  const numberOfValues = value.values.length;
  if (numberOfValues === numberOfLayers) {
    return value;
  }

  return List.of(
    (numberOfLayers < numberOfValues
      ? value.values
      : Array(Math.ceil(numberOfLayers / numberOfValues))
          .fill(value.values)
          .flat()
    ).slice(0, numberOfLayers),
    ", ",
  );
}
