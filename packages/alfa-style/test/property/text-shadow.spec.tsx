import { test } from "@siteimprove/alfa-test";
import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test(`.cascaded() parses \`text-shadow: 1px 1px 2px black;\``, (t) => {
  const element = (
    <span style={{ textShadow: "1px 1px 2px black" }}>Hello world</span>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-shadow").get().toJSON().value, {
    type: "text-shadow",
    color: {
      type: "some",
      value: { type: "color", format: "named", color: "black" },
    },
    offset: {
      type: "tuple",
      values: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    },
    blur: { type: "length", value: 2, unit: "px" },
  });
});

test(`.cascaded() parses \`text-shadow: 1px 1px 2px;\``, (t) => {
  const element = (
    <span style={{ textShadow: "1px 1px 2px" }}>Hello world</span>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-shadow").get().toJSON().value, {
    type: "text-shadow",
    color: { type: "none" },
    offset: {
      type: "tuple",
      values: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    },
    blur: { type: "length", value: 2, unit: "px" },
  });
});

test(`.cascaded() parses \`text-shadow: 1px 1px black;\``, (t) => {
  const element = (
    <span style={{ textShadow: "1px 1px black" }}>Hello world</span>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-shadow").get().toJSON().value, {
    type: "text-shadow",
    color: {
      type: "some",
      value: { type: "color", format: "named", color: "black" },
    },
    offset: {
      type: "tuple",
      values: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    },
    blur: { type: "length", value: 0, unit: "px" },
  });
});

test(`.cascaded() parses \`text-shadow: black 1px 1px;\``, (t) => {
  const element = (
    <span style={{ textShadow: "black 1px 1px" }}>Hello world</span>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-shadow").get().toJSON().value, {
    type: "text-shadow",
    color: {
      type: "some",
      value: { type: "color", format: "named", color: "black" },
    },
    offset: {
      type: "tuple",
      values: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    },
    blur: { type: "length", value: 0, unit: "px" },
  });
});
