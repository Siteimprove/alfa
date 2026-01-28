import type { CSS4Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Option } from "@siteimprove/alfa-option";
import { Context } from "@siteimprove/alfa-selector";

import { type Longhands, Style, type Value } from "../dist/index.js";

const device = Device.standard();

/**
 * @internal
 */
export function cascaded<N extends Longhands.Name>(
  element: Element,
  name: N,
  context: Context = Context.empty(),
): Value.JSON<Style.Cascaded<N>> {
  return Style.from(element, device, context)
    .cascaded(name)
    .getUnsafe()
    .toJSON();
}

/**
 * @internal
 */
export function specified<N extends Longhands.Name>(
  element: Element,
  name: N,
  context: Context = Context.empty(),
): Value.JSON<Style.Specified<N>> {
  return Style.from(element, device, context).specified(name).toJSON();
}

/**
 * @internal
 */
export function computed<N extends Longhands.Name>(
  element: Element,
  name: N,
  context: Context = Context.empty(),
): Value.JSON<Style.Specified<N>> {
  return Style.from(element, device, context).computed(name).toJSON();
}

/**
 * @internal
 */
export function used<N extends Longhands.Name>(
  element: Element,
  name: N,
  context: Context = Context.empty(),
): Value.JSON<Style.Used<N>> {
  return Style.from(element, device, context).used(name).toJSON();
}

/** @internal */
export function color(
  r: number,
  g: number,
  b: number,
  alpha: number = 1,
): CSS4Color.JSON {
  return {
    type: "color",
    space: "srgb",
    coordinates: [r, g, b],
    sRGB: [
      { type: "percentage", value: r },
      { type: "percentage", value: g },
      { type: "percentage", value: b },
    ],
    alpha: { type: "percentage", value: alpha },
  };
}
