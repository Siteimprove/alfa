import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export class Display implements Equatable, Hashable, Serializable {
  public static of(
    resolution: number,
    scan: Display.Scan = Display.Scan.Progressive,
  ): Display {
    return new Display(resolution, scan);
  }

  private readonly _resolution: number;
  private readonly _scan: Display.Scan;

  protected constructor(resolution: number, scan: Display.Scan) {
    this._resolution = resolution;
    this._scan = scan;
  }

  /**
   * {@link https://www.w3.org/TR/mediaqueries/#resolution}
   */
  public get resolution(): number {
    return this._resolution;
  }

  /**
   * {@link https://www.w3.org/TR/mediaqueries/#scan}
   */
  public get scan(): Display.Scan {
    return this._scan;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Display &&
      value._resolution === this._resolution &&
      value._scan === this._scan
    );
  }

  public hash(hash: Hash): void {
    hash.writeUint8(this._resolution);

    switch (this._scan) {
      case Display.Scan.Interlace:
        hash.writeUint8(1);
        break;
      case Display.Scan.Progressive:
        hash.writeUint8(2);
    }
  }

  public toJSON(options?: json.Serializable.Options): Display.JSON {
    return {
      resolution: this._resolution,
      scan: this._scan,
    };
  }
}

/**
 * @public
 */
export namespace Display {
  export enum Scan {
    Interlace = "interlace",
    Progressive = "progressive",
  }

  export interface JSON {
    [key: string]: json.JSON;
    resolution: number;
    scan: `${Scan}`;
  }

  export function from(json: JSON): Display {
    return Display.of(json.resolution, json.scan as Scan);
  }

  export function standard(): Display {
    return Display.of(1, Scan.Progressive);
  }
}
