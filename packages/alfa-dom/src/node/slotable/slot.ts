import { Iterable } from "@siteimprove/alfa-iterable";
import { Element } from "./element.js";
import { Shadow } from "../shadow.js";
import { Slotable } from "./slotable.js";

/** @public */
export type Slot = Element<"slot">;

declare module "./element.js" {
  interface Element<N extends string> {
    /**
     * Get the slotables assigned to this slot.
     *
     * {@link https://html.spec.whatwg.org/#dom-slot-assignednodes}
     */
    assignedNodes(this: Slot): Iterable<Slotable>;

    /**
     * {@link https://dom.spec.whatwg.org/#slot-name}
     */
    slotName(this: Slot): string;

    /**
     * {@link https://dom.spec.whatwg.org/#find-slotables}
     */
    findSlotables(this: Slot): Iterable<Slotable>;
  }
}

Element.prototype.assignedNodes = function (this: Slot): Iterable<Slotable> {
  return this.findSlotables();
};

Element.prototype.slotName = function (this: Slot): string {
  return this.attribute("name")
    .map((name) => name.value)
    .getOr("");
};

Element.prototype.findSlotables = function* (this: Slot): Iterable<Slotable> {
  const root = this.root();

  if (Shadow.isShadow(root)) {
    for (const host of root.host) {
      for (const child of host.children()) {
        if (Slotable.isSlotable(child) && child.assignedSlot().includes(this)) {
          yield child;
        }
      }
    }
  }
};
