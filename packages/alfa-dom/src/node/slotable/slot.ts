import { Iterable } from "@siteimprove/alfa-iterable";
import { Element } from "./element.ts";
import { Shadow } from "../shadow.ts";

import { Slotable as BaseSlotable } from "./slotable.ts";
import type { Slotable } from "./index.ts";

/** @public */
export type Slot = Element<"slot">;

declare module "./element.js" {
  interface Element<N extends string> {
    /**
     * Get the slotables assigned to this slot.
     *
     * {@link https://html.spec.whatwg.org/#dom-slot-assignednodes}
     * {@link https://dom.spec.whatwg.org/#find-slotables}
     */
    assignedNodes(this: Slot): Iterable<Slotable>;

    /**
     * {@link https://dom.spec.whatwg.org/#slot-name}
     */
    slotName(this: Slot): string;
  }
}

Element.prototype.assignedNodes = function* (this: Slot): Iterable<Slotable> {
  const root = this.root();

  if (Shadow.isShadow(root)) {
    for (const host of root.host) {
      for (const child of host.children()) {
        if (
          BaseSlotable.isSlotable(child) &&
          child.assignedSlot().includes(this)
        ) {
          yield child;
        }
      }
    }
  }
};

Element.prototype.slotName = function (this: Slot): string {
  return this.attribute("name")
    .map((name) => name.value)
    .getOr("");
};
