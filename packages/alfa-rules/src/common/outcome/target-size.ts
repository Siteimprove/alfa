import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Either } from "@siteimprove/alfa-either";
import { Element } from "@siteimprove/alfa-dom";

import { WithBoundingBox } from "../diagnostic";

export namespace TargetSize {
    export const IsUserAgentControlled = (name: string, box: Rectangle) =>
        Ok.of(
            WithBoundingBox.of(
                "Target is user agent controlled",
                name,
                box,
                Either.left({ ua: true }),
                [],
            ),
        );

    export const HasSufficientSize = (name: string, box: Rectangle) =>
        Ok.of(
            WithBoundingBox.of(
                "Target has sufficient size",
                name,
                box,
                Either.right({ size: true, spacing: true }),
                [],
            ),
        );

    export const HasInsufficientSize = (name: string, box: Rectangle) =>
        Err.of(
            WithBoundingBox.of(
                "Target has insufficient size",
                name,
                box,
                Either.right({ size: false, spacing: true }),
                [],
            ),
        );

    export const HasSufficientSpacing = (name: string, box: Rectangle) =>
        Ok.of(
            WithBoundingBox.of(
                "Target has sufficient spacing",
                name,
                box,
                Either.right({ size: false, spacing: true }),
                [],
            ),
        );

    export const HasInsufficientSizeAndSpacing = (
        name: string,
        box: Rectangle,
        tooCloseNeighbors: Iterable<Element>,
    ) =>
        Err.of(
            WithBoundingBox.of(
                "Target has insufficient size and spacing",
                name,
                box,
                Either.right({ size: false, spacing: false }),
                tooCloseNeighbors,
            ),
        );
}
