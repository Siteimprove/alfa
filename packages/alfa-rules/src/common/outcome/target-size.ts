import type { Element } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import { Err, Ok } from "@siteimprove/alfa-result";

import { WithClickableRegion } from "../diagnostic.ts";
import type { ClickableRegion } from "../dom/get-clickable-region.ts";

export namespace TargetSize {
  export const IsUserAgentControlled = (
    name: string,
    region: ClickableRegion,
  ) =>
    Ok.of(
      WithClickableRegion.of(
        "Target is user agent controlled",
        name,
        region.boundingBox,
        Either.left({ ua: true }),
        [],
        region.contributors,
        region.subtractors,
      ),
    );

  export const HasSufficientSize = (name: string, region: ClickableRegion) =>
    Ok.of(
      WithClickableRegion.of(
        "Target has sufficient size",
        name,
        region.boundingBox,
        Either.right({ size: true, spacing: true }),
        [],
        region.contributors,
        region.subtractors,
      ),
    );

  export const HasInsufficientSize = (name: string, region: ClickableRegion) =>
    Err.of(
      WithClickableRegion.of(
        "Target has insufficient size",
        name,
        region.boundingBox,
        Either.right({ size: false, spacing: true }),
        [],
        region.contributors,
        region.subtractors,
      ),
    );

  export const HasSufficientSpacing = (name: string, region: ClickableRegion) =>
    Ok.of(
      WithClickableRegion.of(
        "Target has sufficient spacing",
        name,
        region.boundingBox,
        Either.right({ size: false, spacing: true }),
        [],
        region.contributors,
        region.subtractors,
      ),
    );

  export const HasInsufficientSizeAndSpacing = (
    name: string,
    region: ClickableRegion,
    tooCloseNeighbors: Iterable<Element>,
  ) =>
    Err.of(
      WithClickableRegion.of(
        "Target has insufficient size and spacing",
        name,
        region.boundingBox,
        Either.right({ size: false, spacing: false }),
        tooCloseNeighbors,
        region.contributors,
        region.subtractors,
      ),
    );
}
