import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
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

  export type Resolver = Circle.Resolver & Ellipse.Resolver & Extent.Resolver;

  export type PartiallyResolved =
    | Circle.Canonical
    | Ellipse.PartiallyResolved
    | Extent.Canonical;

  export type PartialResolver = Circle.Resolver &
    Ellipse.PartialResolver &
    Extent.Resolver;

  export function partiallyResolve(
    resolver: PartialResolver
  ): (value: Shape) => PartiallyResolved {
    return (value) =>
      Selective.of(value)
        .if(Ellipse.isEllipse, Ellipse.partiallyResolve(resolver))
        .else((value) => value.resolve(resolver))
        .get();
  }

  export const parse = either<Slice<Token>, Shape, string>(
    Ellipse.parse,
    Circle.parse,
    Extent.parse
  );
}
