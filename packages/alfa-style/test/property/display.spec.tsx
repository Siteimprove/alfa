import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

function cascaded(display: string) {
  return Style.from(<div style={{ display }} />, device)
    .cascaded("display")
    .get().value;
}

test("#cascaded() parses `display: none`", (t) => {
  t.deepEqual(cascaded("none").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "none",
      },
    ],
  });
});

test("#cascaded() parses `display: contents`", (t) => {
  t.deepEqual(cascaded("contents").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "contents",
      },
    ],
  });
});

test("#cascaded() parses `display: block`", (t) => {
  t.deepEqual(cascaded("block").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "block",
      },
      {
        type: "keyword",
        value: "flow",
      },
      null,
    ],
  });
});

test("#cascaded() parses `display: inline`", (t) => {
  t.deepEqual(cascaded("inline").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "inline",
      },
      {
        type: "keyword",
        value: "flow",
      },
      null,
    ],
  });
});

test("#cascaded() parses `display: list-item`", (t) => {
  t.deepEqual(cascaded("list-item").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "block",
      },
      {
        type: "keyword",
        value: "flow",
      },
      {
        type: "keyword",
        value: "list-item",
      },
    ],
  });
});
