import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `font-family: Arial`", (t) => {
  const element = (
    <div
      style={{
        fontFamily: "Arial",
      }}
    />
  );

  t.deepEqual(cascaded(element, "font-family"), {
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

  t.deepEqual(cascaded(element, "font-family"), {
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

  t.deepEqual(cascaded(element, "font-family"), {
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

  t.deepEqual(cascaded(element, "font-family"), {
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

  t.deepEqual(cascaded(element, "font-family"), {
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
