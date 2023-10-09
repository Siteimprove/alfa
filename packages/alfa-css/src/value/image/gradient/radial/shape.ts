import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../../../syntax";

import { Circle } from "./circle";
import { Ellipse } from "./ellipse";
import { Extent } from "./extent";

const { either } = Parser;

/**
 * @internal
 */
export type Shape = Circle | Ellipse | Extent;

/**
 * @internal
 */
export namespace Shape {
  export type JSON = Circle.JSON | Ellipse.JSON | Extent.JSON;

  export type Canonical =
    | Circle.Canonical
    | Ellipse.Canonical
    | Extent.Canonical;

  export const parse = either<Slice<Token>, Shape, string>(
    Ellipse.parse,
    Circle.parse,
    Extent.parse
  );
}
