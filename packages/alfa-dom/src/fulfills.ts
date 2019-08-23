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
import { Device, DeviceType, Orientation } from "@siteimprove/alfa-device";
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
      return device.type === DeviceType.Screen;

    case "print":
      return device.type === DeviceType.Print;

    case "speech":
      return device.type === DeviceType.Speech;

    case "all":
      return true;

    default:
      return false;
  }
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

  if (value === undefined) {
  } else {
    switch (value.type) {
      case ValueType.String: {
        switch (mediaFeature.name) {
          case "orientation":
            return fulfillsOrientation(device, value.value);
        }

        break;
      }

      case ValueType.Length: {
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

function fulfillsOrientation(device: Device, orientation: string): boolean {
  switch (device.viewport.orientation) {
    case Orientation.Landscape:
      return orientation === "landscape";

    case Orientation.Portrait:
      return orientation === "portrait";
  }

  return false;
}
