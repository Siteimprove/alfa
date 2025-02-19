import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export class Viewport implements Equatable, Hashable, Serializable {
  public static of(
    width: number,
    height: number = width / (16 / 9),
    orientation: Viewport.Orientation = Viewport.Orientation.Landscape,
  ): Viewport {
    return new Viewport(width, height, orientation);
  }

  private readonly _width: number;
  private readonly _height: number;
  private readonly _orientation: Viewport.Orientation;

  protected constructor(
    width: number,
    height: number,
    orientation: Viewport.Orientation,
  ) {
    this._width = width;
    this._height = height;
    this._orientation = orientation;
  }

  /**
   * {@link https://www.w3.org/TR/mediaqueries/#width}
   */
  public get width(): number {
    return this._width;
  }

  /**
   * {@link https://www.w3.org/TR/mediaqueries/#height}
   */
  public get height(): number {
    return this._height;
  }

  /**
   * {@link https://www.w3.org/TR/mediaqueries/#orientation}
   */
  public get orientation(): Viewport.Orientation {
    return this._orientation;
  }

  public isLandscape(): boolean {
    return this._orientation === Viewport.Orientation.Landscape;
  }

  public isPortrait(): boolean {
    return this._orientation === Viewport.Orientation.Portrait;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Viewport &&
      value._width === this._width &&
      value._height === this._height &&
      value._orientation === this._orientation
    );
  }

  public hash(hash: Hash): void {
    hash.writeUint32(this._width);
    hash.writeUint32(this._height);

    switch (this._orientation) {
      case Viewport.Orientation.Landscape:
        hash.writeUint8(1);
        break;
      case Viewport.Orientation.Portrait:
        hash.writeUint8(2);
    }
  }

  public toJSON(options?: json.Serializable.Options): Viewport.JSON {
    return {
      width: this._width,
      height: this._height,
      orientation: this._orientation,
    };
  }
}

/**
 * @public
 */
export namespace Viewport {
  export enum Orientation {
    Portrait = "portrait",
    Landscape = "landscape",
  }

  export interface JSON {
    [key: string]: json.JSON;
    width: number;
    height: number;
    orientation: `${Orientation}`;
  }

  export function from(json: JSON): Viewport {
    return Viewport.of(
      json.width,
      json.height,
      json.orientation as Orientation,
    );
  }

  export function standard(): Viewport {
    return Viewport.of(1280, 720, Orientation.Landscape);
  }
}
