import {
  MediaCondition,
  MediaFeature,
  MediaOperator,
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
  const { features, operator } = mediaCondition;

  for (const feature of features) {
    const fulfills =
      "features" in feature
        ? fulfillsMediaCondition(device, feature)
        : fulfillsMediaFeature(device, feature);

    if (operator === MediaOperator.Or) {
      if (fulfills) {
        return true;
      }
    } else {
      if (!fulfills) {
        return false;
      }
    }
  }

  if (operator === MediaOperator.Or) {
    return false;
  } else {
    return true;
  }
}

function fulfillsMediaFeature(
  device: Device,
  mediaFeature: MediaFeature
): boolean {
  return false;
}
