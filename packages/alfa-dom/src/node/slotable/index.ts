export * from "./element.ts";
// Load the slot augments.
import "./slot.js";
export * from "./text.ts";

import { Element } from "./element.ts";
import { Text } from "./text.ts";

/** @public */
export type Slotable = Element | Text;

/** @public */
export namespace Slotable {
  export function isSlotable(value: unknown): value is Slotable {
    return Element.isElement(value) || Text.isText(value);
  }
}
