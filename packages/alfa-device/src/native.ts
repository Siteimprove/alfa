/// <reference lib="dom" />

import type { Device } from ".";

/**
 * @internal
 */
export namespace Native {
  export function fromWindow(window: globalThis.Window): Device.JSON {
    const {
      documentElement: { clientWidth, clientHeight },
    } = window.document;

    return {
      type: "screen",
      viewport: {
        width: clientWidth,
        height: clientHeight,
        orientation: window.matchMedia("(orientation: landscape)").matches
          ? "landscape"
          : "portrait",
      },
      display: {
        resolution: window.devicePixelRatio,
        scan: "progressive",
      },
      scripting: {
        enabled: !window.matchMedia("(scripting: none)").matches,
      },
      preferences: [],
    };
  }
}
