import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../src/style";

test("#cascaded() returns the cascaded value of a property", (t) => {
  const element = <div id="target" style={{ color: "red", "--foo": "lime", backgroundColor: "var(--foo, cyan)" }}></div>;

  console.log("-----   Creating style  -----");
  const style = Style.from(element, Device.standard());

  console.log("-----   Triggering substitution  -----");
  const bgComputed = style.computed("background-color").toJSON();
  console.log("-----   Computed BG color  -----");
  console.log(bgComputed);

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red").toJSON(),
  });
});

test("#cascaded() correctly handles duplicate properties", (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", [
          h.declaration("color", "red"),
          h.declaration("color", "green"),
        ]),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green").toJSON(),
  });
});

test("#cascaded() returns the most specific property value", (t) => {
  const element = <div style={{ color: "green !important" }} />;

  h.document(
    [],
    [
      h.sheet([
        h.rule.style("div.foo", { color: "green" }),
        h.rule.style("div", { color: "red" }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green", true).toJSON(),
  });
});

test("#cascaded() correctly handles inline styles overriding the sheet", (t) => {
  const element = <div style={{ color: "green !important" }} />;

  h.document([element], [h.sheet([h.rule.style("div", { color: "red" })])]);

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green", true).toJSON(),
  });
});

test(`#cascaded() correctly handles an important declaration overriding inline
      styles`, (t) => {
  const element = <div style={{ color: "green" }} />;

  h.document(
    [element],
    [h.sheet([h.rule.style("div", { color: "red !important" })])]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red", true).toJSON(),
  });
});

test(`#cascaded() correctly handles important inline styles overriding an
      important declaration`, (t) => {
  const element = <div style={{ color: "green !important" }} />;

  h.document(
    [element],
    [h.sheet([h.rule.style("div", { color: "red !important" })])]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green", true).toJSON(),
  });
});

test(`#cascaded() correctly handles a shorthand declaration overriding a
      longhand declaration`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "visible",
          overflow: "hidden",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow", "hidden").toJSON(),
  });
});

test(`#cascaded() correctly handles a longhand declaration overriding a
      shorthand declaration`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          overflowX: "visible",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "visible",
    },
    source: h.declaration("overflow-x", "visible").toJSON(),
  });
});

