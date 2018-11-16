import {
  MediaCondition,
  MediaFeature,
  MediaQualifier,
  MediaQuery,
  MediaType,
  parseMediaQuery
} from "@siteimprove/alfa-css";
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
  const { qualifier } = mediaQuery;

  if (mediaQuery.type !== undefined) {
    if (
      !fulfillsMediaType(device, mediaQuery.type) ||
      qualifier === MediaQualifier.Not
    ) {
      return false;
    }
  }

  if (mediaQuery.condition !== undefined) {
    if (
      !fulfillsMediaCondition(device, mediaQuery.condition) ||
      qualifier === MediaQualifier.Not
    ) {
      return false;
    }
  }

  return true;
}

function fulfillsMediaType(device: Device, mediaType: MediaType): boolean {
  switch (mediaType) {
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

  return true;
}

function fulfillsMediaCondition(
  device: Device,
  mediaCondition: MediaCondition
): boolean {
  const { feature } = mediaCondition;

  if ("feature" in feature) {
    return fulfillsMediaCondition(device, feature);
  }

  if ("name" in feature) {
    return fulfillsMediaFeature(device, feature);
  }

  return false;
}

function fulfillsMediaFeature(
  device: Device,
  mediaFeature: MediaFeature
): boolean {
  return false;
}
