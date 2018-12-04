import {
  MediaCondition,
  MediaFeature,
  MediaOperator,
  MediaQualifier,
  MediaQuery,
  MediaType,
  parseMediaQuery,
  Resolvers,
  ValueType
} from "@siteimprove/alfa-css";
import { Device, DeviceType } from "@siteimprove/alfa-device";
import { isMediaRule } from "./guards";
import { ConditionRule } from "./types";

const { isArray } = Array;

/**
 * Given a device and a condition rule, check if the device fulfills the rule.
 */
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

/**
 * Given a device and a media query, check if the device fulfills the media
 * query.
 */
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
  const { value } = mediaFeature;

  if (value !== undefined && value.type === ValueType.Length) {
    const resolved = Resolvers.length(value, device);

    switch (mediaFeature.name) {
      case "width":
        return fulfillsWidth(device, resolved.value);

      case "max-width":
        return fulfillsWidth(device, [0, resolved.value]);

      case "min-width":
        return fulfillsWidth(device, [resolved.value, Infinity]);

      case "height":
        return fulfillsHeight(device, resolved.value);

      case "max-height":
        return fulfillsHeight(device, [0, resolved.value]);

      case "min-height":
        return fulfillsHeight(device, [resolved.value, Infinity]);
    }
  }

  return false;
}

function fulfillsRange(
  value: number,
  range: number | [number, number]
): boolean {
  range = typeof range === "number" ? [range, range] : range;

  const [lower, upper] = range;

  return value >= lower && value <= upper;
}

function fulfillsWidth(
  device: Device,
  range: number | [number, number]
): boolean {
  return fulfillsRange(device.viewport.width, range);
}

function fulfillsHeight(
  device: Device,
  range: number | [number, number]
): boolean {
  return fulfillsRange(device.viewport.height, range);
}
