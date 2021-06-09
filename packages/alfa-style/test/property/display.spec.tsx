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

test("#cascaded() parses `display: inline-block`", (t) => {
  t.deepEqual(cascaded("inline-block").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "inline",
      },
      {
        type: "keyword",
        value: "flow-root",
      },
    ],
  });
});

test("#cascaded() parses `display: inline flow`", (t) => {
  t.deepEqual(cascaded("inline flow").toJSON(), {
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
    ],
  });
});

test("#cascaded() parses `display: inline flow list-item`", (t) => {
  t.deepEqual(cascaded("inline flow list-item").toJSON(), {
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
      {
        type: "keyword",
        value: "list-item",
      },
    ],
  });
});

test("#cascaded() parses `display: block flow`", (t) => {
  t.deepEqual(cascaded("block flow").toJSON(), {
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
    ],
  });
});

test("#cascaded() parses `display: block flow list-item`", (t) => {
  t.deepEqual(cascaded("block flow list-item").toJSON(), {
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

test("#cascaded() parses `display: table-row`", (t) => {
  t.deepEqual(cascaded("table-row").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "table-row",
      },
      {
        type: "keyword",
        value: "flow-root",
      },
    ],
  });
});

test("#cascaded() parses `display: ruby-text`", (t) => {
  t.deepEqual(cascaded("ruby-text").toJSON(), {
    type: "tuple",
    values: [
      {
        type: "keyword",
        value: "ruby-text",
      },
      {
        type: "keyword",
        value: "flow",
      },
    ],
  });
});
