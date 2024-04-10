/// <reference lib="dom" />

import type { Device, Preference } from ".";

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
      preferences: [...toPreferences(window)],
    };
  }

  const userPreferences: Array<[name: string, values: Array<string>]> = [
    ["forced-colors", ["none", "active"]],
    ["inverted", ["none", "inverted"]],
    ["prefers-color-scheme", ["light", "dark"]],
    ["prefers-contrast", ["no-preference", "less", "more", "custom"]],
    ["prefers-reduced-motion", ["no-preference", "reduce"]],
    ["prefers-reduced-transparency", ["no-preference", "reduce"]],
    ["prefers-reduced-data", ["no-preference", "reduce"]],
  ];

  function* toPreferences(
    window: globalThis.Window,
  ): Iterable<Preference.JSON> {
    // It seems we need to manually query each preference individually.
    for (const [name, values] of userPreferences) {
      for (const value of values) {
        if (window.matchMedia(`(${name}: ${value})`).matches) {
          yield { name, value };
        }
      }
    }
  }
}
