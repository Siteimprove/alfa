import {
  Angle,
  Keyword,
  Length,
  Matrix,
  Percentage,
  Perspective,
  Rotate,
  Scale,
  Skew,
  Translate,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { map, either } = Parser;

export type Transform = Transform.Specified | Transform.Computed;

export namespace Transform {
  export type None = Keyword<"none">;

  export type Specified =
    | None
    | List<Matrix | Perspective | Rotate | Scale | Skew | Translate>;

  export type Computed =
    | None
    | List<
        | Matrix
        | Perspective<Length<"px">>
        | Rotate<Angle<"deg">>
        | Scale
        | Skew<Angle<"deg">, Angle<"deg">>
        | Translate<
            Length<"px"> | Percentage,
            Length<"px"> | Percentage,
            Length<"px">
          >
      >;
}

export const Transform: Property<
  Transform.Specified,
  Transform.Computed
> = Property.of(
  Keyword.of("none"),
  either(
    Keyword.parse("none"),
    map(css.Transform.parseList, (transforms) => List.of(transforms))
  ),
  (style) =>
    style.specified("transform").map((transform) => {
      switch (transform.type) {
        case "keyword":
          return transform;

        case "list":
          return List.of([
            ...Iterable.map(transform, (transform) => {
              switch (transform.kind) {
                case "matrix":
                  return transform;

                case "perspective":
                  return Perspective.of(
                    Resolver.length(transform.depth, style)
                  );

                case "rotate":
                  return Rotate.of(
                    transform.x,
                    transform.y,
                    transform.z,
                    transform.angle.withUnit("deg")
                  );

                case "scale":
                  return transform;

                case "skew":
                  return Skew.of(
                    transform.x.withUnit("deg"),
                    transform.y.withUnit("deg")
                  );

                case "translate":
                  return Translate.of(
                    transform.x.type === "percentage"
                      ? transform.x
                      : Resolver.length(transform.x, style),
                    transform.y.type === "percentage"
                      ? transform.y
                      : Resolver.length(transform.y, style),
                    Resolver.length(transform.z, style)
                  );
              }
            }),
          ]);
      }
    })
);
