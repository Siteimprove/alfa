export * from "./element.js";
// Load the slot augments.
import "./slot.js";
export * from "./text.js";

import { Element } from "./element.js";
import { Text } from "./text.js";

/** @public */
export type Slotable = Element | Text;

/** @public */
export namespace Slotable {
  export function isSlotable(value: unknown): value is Slotable {
    return Element.isElement(value) || Text.isText(value);
  }
}
