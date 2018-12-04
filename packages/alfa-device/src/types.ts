export const enum Orientation {
  Portrait,
  Landscape
}

export const enum Scan {
  Interlace,
  Progressive
}

export interface Viewport {
  /**
   * @see https://www.w3.org/TR/mediaqueries/#width
   */
  readonly width: number;

  /**
   * @see https://www.w3.org/TR/mediaqueries/#height
   */
  readonly height: number;

  /**
   * @see https://www.w3.org/TR/mediaqueries/#orientation
   */
  readonly orientation: Orientation;
}

export interface Display {
  /**
   * @see https://www.w3.org/TR/mediaqueries/#resolution
   */
  readonly resolution: number;

  /**
   * @see https://www.w3.org/TR/mediaqueries/#scan
   */
  readonly scan?: Scan;
}

export const enum DeviceType {
  Print,
  Screen,
  Speech
}

export interface Device {
  readonly type: DeviceType;
  readonly viewport: Viewport;
  readonly display: Display;
}
