import { test } from "@siteimprove/alfa-test";

import { cascaded } from "../common";
import { Style } from "../../src";
import { Device } from "@siteimprove/alfa-device";

test(`.cascaded() parses \`text-shadow: 1px 1px 2px black;\``, (t) => {
  const element = (
    <span style={{ textShadow: "1px 1px 2px black" }}>Hello world</span>
  );

  t.deepEqual(cascaded(element, "text-shadow").value, {
    type: "list",
    values: [
      {
        type: "shadow",
        vertical: { type: "length", value: 1, unit: "px" },
        horizontal: { type: "length", value: 1, unit: "px" },
        blur: { type: "length", value: 2, unit: "px" },
        spread: { type: "length", value: 0, unit: "px" },
        color: { type: "color", format: "named", color: "black" },
        isInset: false,
      },
    ],
    separator: ", ",
  });
});

test(`.cascaded() parses \`text-shadow: 1px 1px 2px;\``, (t) => {
  const element = (
    <span style={{ textShadow: "1px 1px 2px" }}>Hello world</span>
  );

  t.deepEqual(cascaded(element, "text-shadow").value, {
    type: "list",
    values: [
      {
        type: "shadow",
        vertical: { type: "length", value: 1, unit: "px" },
        horizontal: { type: "length", value: 1, unit: "px" },
        blur: { type: "length", value: 2, unit: "px" },
        spread: { type: "length", value: 0, unit: "px" },
        color: { type: "keyword", value: "currentcolor" },
        isInset: false,
      },
    ],
    separator: ", ",
  });
});

test(`.cascaded() parses \`text-shadow: 1px 1px black;\``, (t) => {
  const element = (
    <span style={{ textShadow: "1px 1px black" }}>Hello world</span>
  );

  t.deepEqual(cascaded(element, "text-shadow").value, {
    type: "list",
    values: [
      {
        type: "shadow",
        vertical: { type: "length", value: 1, unit: "px" },
        horizontal: { type: "length", value: 1, unit: "px" },
        blur: { type: "length", value: 0, unit: "px" },
        spread: { type: "length", value: 0, unit: "px" },
        color: { type: "color", format: "named", color: "black" },
        isInset: false,
      },
    ],
    separator: ", ",
  });
});

test(`.cascaded() parses \`text-shadow: black 1px 1px;\``, (t) => {
  const element = (
    <span style={{ textShadow: "black 1px 1px" }}>Hello world</span>
  );

  t.deepEqual(cascaded(element, "text-shadow").value, {
    type: "list",
    values: [
      {
        type: "shadow",
        vertical: { type: "length", value: 1, unit: "px" },
        horizontal: { type: "length", value: 1, unit: "px" },
        blur: { type: "length", value: 0, unit: "px" },
        spread: { type: "length", value: 0, unit: "px" },
        color: { type: "color", format: "named", color: "black" },
        isInset: false,
      },
    ],
    separator: ", ",
  });
});

test(`.cascaded() accepts list of shadowds`, (t) => {
  const element = (
    <span style={{ textShadow: "black 1px 1px, 2px 2px red" }}>
      Hello world
    </span>
  );

  t.deepEqual(cascaded(element, "text-shadow").value, {
    type: "list",
    values: [
      {
        type: "shadow",
        vertical: { type: "length", value: 1, unit: "px" },
        horizontal: { type: "length", value: 1, unit: "px" },
        blur: { type: "length", value: 0, unit: "px" },
        spread: { type: "length", value: 0, unit: "px" },
        color: { type: "color", format: "named", color: "black" },
        isInset: false,
      },
      {
        type: "shadow",
        vertical: { type: "length", value: 2, unit: "px" },
        horizontal: { type: "length", value: 2, unit: "px" },
        blur: { type: "length", value: 0, unit: "px" },
        spread: { type: "length", value: 0, unit: "px" },
        color: { type: "color", format: "named", color: "red" },
        isInset: false,
      },
    ],
    separator: ", ",
  });
});

test(`.specified() doesn't accept spread nor inset`, (t) => {
  const withInset = (
    <span style={{ textShadow: "1px 1px black true" }}>Hello world</span>
  );

  t.deepEqual(
    Style.from(withInset, Device.standard()).cascaded("text-shadow").isNone(),
    true
  );

  const withSpread = (
    // x y blur spread
    <span style={{ textShadow: "1px 1px 0px 2px black" }}>Hello world</span>
  );

  t.deepEqual(
    Style.from(withSpread, Device.standard()).cascaded("text-shadow").isNone(),
    true
  );
});
