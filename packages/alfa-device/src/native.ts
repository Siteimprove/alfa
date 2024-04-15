/// <reference lib="dom" />

import { type Device, Preference } from ".";

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

  const userPreferences = Object.keys(
    Preference.preferences,
  ) as Array<Preference.Name>;

  function* toPreferences(
    window: globalThis.Window,
  ): Iterable<Preference.JSON> {
    // It seems we need to manually query each preference individually.
    for (const name of userPreferences) {
      for (const value of Preference.preferences[name]) {
        if (window.matchMedia(`(${name}: ${value})`).matches) {
          yield { name, value };
        }
      }
    }
  }
}
