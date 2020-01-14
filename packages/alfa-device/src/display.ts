export class Display {
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

  public toJSON(): Display.JSON {
    return {
      resolution: this._resolution,
      scan: this._scan
    };
  }
}

export namespace Display {
  export enum Scan {
    Interlace = "interlace",
    Progressive = "progressive"
  }

  export interface JSON {
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
