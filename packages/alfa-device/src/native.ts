/// <reference lib="dom" />

/**
 * The function defined in this file is destined to be injected into a browser
 * page, either through a web extension or browser automation tool.
 *
 * As such, it must be serializable, meaning it must not reference any external
 * file (only import type are allowed), and may not use annex functions (who
 * must instead be inlined in the main function).
 *
 * We could use Webpack or the like to bundle the current file with its
 * dependencies into a single file. This is however somewhat heavy-handed, and
 * the rest of Alfa has no need for such complex machinery, so we stick to a
 * simple solution for now.
 */

import type { Device, Preference } from "./index.js";

/**
 * @internal
 */
export namespace Native {
  export function fromWindow(
    myWindow: globalThis.Window = window,
  ): Device.JSON {
    return toDevice();

    function toDevice(): Device.JSON {
      const {
        documentElement: { clientWidth, clientHeight },
      } = myWindow.document;

      return {
        type: "screen",
        viewport: {
          width: clientWidth,
          height: clientHeight,
          orientation: myWindow.matchMedia("(orientation: landscape)").matches
            ? "landscape"
            : "portrait",
        },
        display: { resolution: myWindow.devicePixelRatio, scan: "progressive" },
        scripting: {
          enabled: !myWindow.matchMedia("(scripting: none)").matches,
        },
        preferences: [...toPreferences()],
      };
    }

    function* toPreferences(): Iterable<Preference.JSON> {
      // Since everything has to be inlined, we need to redeclare it here.
      // Typing ensure that there isn't too many mistakes (a value may
      // still be missing).
      const preferences: {
        [K in Preference.Name]: Array<Preference.Value<K>>;
      } = {
        "forced-colors": ["none", "active"],
        inverted: ["none", "inverted"],
        "prefers-color-scheme": ["no-preference", "light", "dark"],
        "prefers-contrast": ["no-preference", "less", "more", "custom"],
        "prefers-reduced-motion": ["no-preference", "reduce"],
        "prefers-reduced-transparency": ["no-preference", "reduce"],
        "prefers-reduced-data": ["no-preference", "reduce"],
      };

      // It seems we need to manually query each preference individually.
      for (const name of Object.keys(preferences) as Array<Preference.Name>) {
        for (const value of preferences[name]) {
          if (myWindow.matchMedia(`(${name}: ${value})`).matches) {
            yield { name, value };
          }
        }
      }
    }
  }
}
