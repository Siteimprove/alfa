import { Predicate } from "@siteimprove/alfa-predicate";

import { ColGroup, Cell, RowGroup } from "./groups";

export function isCovering(
  x: number,
  y: number
): Predicate<Cell | RowGroup | ColGroup> {
  function covering(cover: Cell | RowGroup | ColGroup) {
    if (cover.isColGroup()) {
      // Cell or Col
      if (x < cover.anchor.x) {
        // slot is left of cover
        return false;
      }
      if (cover.anchor.x + cover.width - 1 < x) {
        // slot is right of cover
        return false;
      }
    }

    if (cover.isRowGroup()) {
      // Cell or Row
      if (y < cover.anchor.y) {
        // slot is above cover
        return false;
      }
      if (cover.anchor.y + cover.height - 1 < y) {
        // slot is below cover
        return false;
      }
    }

    return true;
  }
  return covering;
}
