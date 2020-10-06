import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";

import { Angle } from "../angle";
import { Length } from "../length";
import { Percentage } from "../percentage";
import { Gradient } from "../gradient";
import { Position } from "../position";

const { map, either, pair, option, left, right, delimited } = Parser;

/**
 * @see https://drafts.csswg.org/css-images/#radial-gradients
 */
export class Radial<I extends Gradient.Item = Gradient.Item>
  implements Equatable, Serializable {}

export namespace Radial {
  /**
   * @see https://drafts.csswg.org/css-images/#valdef-ending-shape-circle
   */
  export class Circle<R extends Length = Length>
    implements Equatable, Serializable {
    private readonly _radius: R;

    public get type(): "circle" {
      return "circle";
    }
  }

  /**
   * @see https://drafts.csswg.org/css-images/#valdef-ending-shape-ellipse
   */
  export class Ellipse<R extends Length | Percentage = Length | Percentage>
    implements Equatable, Serializable {
    private readonly _horizontal: R;
    private readonly _vertical: R;

    public get type(): "circle" {
      return "circle";
    }
  }

  export class Extent implements Equatable, Serializable {
    private readonly _shape: "circle" | "ellipse";
    private readonly _extent:
      | "closest-side"
      | "farthest-side"
      | "closest-corner"
      | "farthest-corner";

    public get type(): "extent" {
      return "extent";
    }

    public get shape(): "circle" | "ellipse" {
      return this._shape;
    }

    public get extent():
      | "closest-side"
      | "farthest-side"
      | "closest-corner"
      | "farthest-corner" {
      return this._extent;
    }
  }
}
