import { Serializable } from "@siteimprove/alfa-json";
import * as json from "@siteimprove/alfa-json";

export class Viewport implements Serializable {
  public static of(
    width: number,
    height: number,
    orientation: Viewport.Orientation = Viewport.Orientation.Landscape
  ): Viewport {
    return new Viewport(width, height, orientation);
  }

  private readonly _width: number;
  private readonly _height: number;
  private readonly _orientation: Viewport.Orientation;

  private constructor(
    width: number,
    height: number,
    orientation: Viewport.Orientation
  ) {
    this._width = width;
    this._height = height;
    this._orientation = orientation;
  }

  /**
   * @see https://www.w3.org/TR/mediaqueries/#width
   */
  public get width(): number {
    return this._width;
  }

  /**
   * @see https://www.w3.org/TR/mediaqueries/#height
   */
  public get height(): number {
    return this._height;
  }

  /**
   * @see https://www.w3.org/TR/mediaqueries/#orientation
   */
  public get orientation(): Viewport.Orientation {
    return this._orientation;
  }

  public toJSON(): Viewport.JSON {
    return {
      width: this._width,
      height: this._height,
      orientation: this._orientation
    };
  }
}

export namespace Viewport {
  export enum Orientation {
    Portrait = "portrait",
    Landscape = "landscape"
  }

  export interface JSON {
    [key: string]: json.JSON;
    width: number;
    height: number;
    orientation: Orientation;
  }

  export function from(json: JSON): Viewport {
    return Viewport.of(json.width, json.height, json.orientation);
  }

  export function standard(): Viewport {
    return Viewport.of(1280, 720, Orientation.Landscape);
  }
}
