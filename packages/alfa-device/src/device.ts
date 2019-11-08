const { freeze } = Object;

export const enum Orientation {
  Portrait = "portrait",
  Landscape = "landscape"
}

export const enum Scan {
  Interlace = "interlace",
  Progressive = "progressive"
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

export interface Device {
  readonly type: Device.Type;
  readonly viewport: Viewport;
  readonly display: Display;
}

export namespace Device {
  export const enum Type {
    Print = "print",
    Screen = "screen",
    Speech = "speech"
  }

  const defaultDevice: Device = freeze({
    type: Device.Type.Screen,
    viewport: {
      width: 1280,
      height: 720,
      orientation: Orientation.Landscape
    },
    display: {
      resolution: 1
    }
  });

  export function getDefaultDevice(): Device {
    return defaultDevice;
  }
}
