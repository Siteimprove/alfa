import { Device, DeviceType, Orientation } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";
import { fulfills } from "../src/fulfills";
import { MediaRule, RuleType } from "../src/types";

function mediaRule(condition: string): MediaRule {
  return {
    type: RuleType.Media,
    conditionText: condition,
    cssRules: []
  };
}

const device: Device = {
  type: DeviceType.Screen,
  viewport: {
    width: 1280,
    height: 720,
    orientation: Orientation.Landscape
  },
  display: {
    resolution: 1
  }
};

test("Checks fulfillment of a media type", t => {
  t(fulfills(device, mediaRule("screen")));
  t(!fulfills(device, mediaRule("not screen")));
  t(!fulfills(device, mediaRule("print")));
});

test("Checks fulfillment of a max-width media feature", t => {
  t(fulfills(device, mediaRule("(max-width: 1281px)")));
  t(fulfills(device, mediaRule("(max-width: 1280px)")));
  t(!fulfills(device, mediaRule("(max-width: 1279px)")));
});

test("Checks fulfillment of a min-width media feature", t => {
  t(fulfills(device, mediaRule("(min-width: 721px)")));
  t(fulfills(device, mediaRule("(min-width: 720px)")));
  t(fulfills(device, mediaRule("(min-width: 719px)")));
});
