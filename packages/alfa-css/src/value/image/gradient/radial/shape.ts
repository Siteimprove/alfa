import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Token } from "../../../../syntax/index.js";

import { Circle } from "./circle.js";
import { Ellipse } from "./ellipse.js";
import { Extent } from "./extent.js";

const { either } = Parser;

/**
 * @internal
 */
export type Shape = Circle | Ellipse | Extent;

/**
 * Radial gradient shapes
 *
 * @remarks
 * The syntax inside a radial-gradient() function is significantly different
 * from the basic shape functions circle() and ellipse(), so we cannot easily
 * reuse the code.
 *
 * @internal
 */
export namespace Shape {
  export type JSON = Circle.JSON | Ellipse.JSON | Extent.JSON;

  export type Canonical =
    | Circle.Canonical
    | Ellipse.Canonical
    | Extent.Canonical;

  export type Resolver = Circle.Resolver & Ellipse.Resolver & Extent.Resolver;

  export type PartiallyResolved =
    | Circle.Canonical
    | Ellipse.PartiallyResolved
    | Extent.Canonical;

  export type PartialResolver = Circle.Resolver &
    Ellipse.PartialResolver &
    Extent.Resolver;

  export function partiallyResolve(
    resolver: PartialResolver,
  ): (value: Shape) => PartiallyResolved {
    return (value) =>
      Selective.of(value)
        .if(Ellipse.isEllipse, (ellipse) => ellipse.partiallyResolve(resolver))
        .else((value) => value.resolve(resolver))
        .get();
  }

  export const parse = either<Slice<Token>, Shape, string>(
    Ellipse.parse,
    Circle.parse,
    Extent.parse,
  );
}
