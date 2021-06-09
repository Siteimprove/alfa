import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `font-family: Arial`", (t) => {
  const element = (
    <div
      style={{
        fontFamily: "Arial",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-family").get().toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "string",
          value: "Arial",
        },
      ],
    },
    source: h.declaration("font-family", "Arial").toJSON(),
  });
});

test("#cascaded() parses `font-family: serif`", (t) => {
  const element = (
    <div
      style={{
        fontFamily: "serif",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-family").get().toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "serif",
        },
      ],
    },
    source: h.declaration("font-family", "serif").toJSON(),
  });
});

test(`#cascaded() parses \`font-family: "Times New Roman"\``, (t) => {
  const element = (
    <div
      style={{
        fontFamily: `"Times New Roman"`,
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-family").get().toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "string",
          value: "Times New Roman",
        },
      ],
    },
    source: h.declaration("font-family", `"Times New Roman"`).toJSON(),
  });
});

test(`#cascaded() parses \`font-family: Times New Roman\``, (t) => {
  const element = (
    <div
      style={{
        fontFamily: "Times New Roman",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-family").get().toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "string",
          value: "Times New Roman",
        },
      ],
    },
    source: h.declaration("font-family", "Times New Roman").toJSON(),
  });
});

test(`#cascaded() parses \`font-family: Arial, sans-serif\``, (t) => {
  const element = (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-family").get().toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "string",
          value: "Arial",
        },
        {
          type: "keyword",
          value: "sans-serif",
        },
      ],
    },
    source: h.declaration("font-family", "Arial, sans-serif").toJSON(),
  });
});
