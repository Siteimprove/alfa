import { MediaQuery, parseMediaQuery } from "@siteimprove/alfa-css";
import { Device, DeviceType } from "@siteimprove/alfa-device";
import { isMediaRule } from "./guards";
import { ConditionRule } from "./types";

const { isArray } = Array;

export function fulfills(device: Device, rule: ConditionRule): boolean {
  if (isMediaRule(rule)) {
    let mediaQueries = parseMediaQuery(rule.conditionText);

    if (mediaQueries !== null) {
      mediaQueries = isArray(mediaQueries) ? mediaQueries : [mediaQueries];

      for (const mediaQuery of mediaQueries) {
        if (fulfillsMediaQuery(device, mediaQuery)) {
          return true;
        }
      }
    }
  }

  return false;
}

function fulfillsMediaQuery(device: Device, mediaQuery: MediaQuery): boolean {
  switch (mediaQuery.type) {
    case "screen":
      if (device.type !== DeviceType.Screen) {
        return false;
      }
      break;

    case "print":
      if (device.type !== DeviceType.Print) {
        return false;
      }
      break;

    case "speech":
      if (device.type !== DeviceType.Speech) {
        return false;
      }
      break;

    case "all":
    case undefined:
      break;

    default:
      return false;
  }

  return false;
}
