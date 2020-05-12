import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export class Display implements Equatable, Hashable, Serializable {
  public static of(
    resolution: number,
    scan: Display.Scan = Display.Scan.Progressive
  ): Display {
    return new Display(resolution, scan);
  }

  private readonly _resolution: number;
  private readonly _scan: Display.Scan;

  private constructor(resolution: number, scan: Display.Scan) {
    this._resolution = resolution;
    this._scan = scan;
  }

  /**
   * @see https://www.w3.org/TR/mediaqueries/#resolution
   */
  public get resolution(): number {
    return this._resolution;
  }

  /**
   * @see https://www.w3.org/TR/mediaqueries/#scan
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
    Hash.writeUint8(hash, this._resolution);

    switch (this._scan) {
      case Display.Scan.Interlace:
        Hash.writeUint8(hash, 1);
        break;
      case Display.Scan.Progressive:
        Hash.writeUint8(hash, 2);
    }
  }

  public toJSON(): Display.JSON {
    return {
      resolution: this._resolution,
      scan: this._scan,
    };
  }
}

export namespace Display {
  export enum Scan {
    Interlace = "interlace",
    Progressive = "progressive",
  }

  export interface JSON {
    [key: string]: json.JSON;
    resolution: number;
    scan: Scan;
  }

  export function from(json: JSON): Display {
    return Display.of(json.resolution, json.scan);
  }

  export function standard(): Display {
    return Display.of(1, Scan.Progressive);
  }
}
