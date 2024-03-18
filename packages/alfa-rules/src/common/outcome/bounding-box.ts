import { Err, Ok } from "@siteimprove/alfa-result";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { WithBoundingBox } from "../diagnostic";

/**
 * @public
 */
export namespace BoundingBox {
  export const HasSufficientSize = (name: string, box: Rectangle) =>
    Ok.of(WithBoundingBox.of("Target has sufficient size", name, box));

  export const HasInsufficientSize = (name: string, box: Rectangle) =>
    Err.of(WithBoundingBox.of("Target has insufficient size", name, box));

  export const IsUserAgentControlled = (name: string, box: Rectangle) =>
    Ok.of(WithBoundingBox.of("Target is user agent controlled", name, box));
}
