import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../src/style";

test("#cascaded() returns the cascaded value of a property", (t) => {
  const element = <div style={{ color: "red" }}></div>;

  const style = Style.from(element, Device.standard());

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

test(`#cascaded() expands a var() function`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          "--hidden": "hidden",
          overflowX: "var(--hidden)",
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
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() expands a var() function with a fallback`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--hidden, hidden)",
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
    source: h.declaration("overflow-x", "var(--hidden, hidden)").toJSON(),
  });
});

test(`#cascaded() expands a var() function with an inherited value`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("main", {
          "--hidden": "hidden",
        }),

        h.rule.style("div", {
          overflowX: "var(--hidden)",
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
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() expands a var() function with an overridden value`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("main", {
          "--hidden": "hidden",
        }),

        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "visible",
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
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() expands a var() function with a value that contains another
      var() function`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "var(--really-hidden)",
          "--really-hidden": "hidden",
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
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() expands multiple var() functions in the same declaration`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "var(--hidden) var(--visible)",

          "--hidden": "hidden",
          "--visible": "visible",
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
    source: h.declaration("overflow", "var(--hidden) var(--visible)").toJSON(),
  });

  t.deepEqual(style.cascaded("overflow-y").get().toJSON(), {
    value: {
      type: "keyword",
      value: "visible",
    },
    source: h.declaration("overflow", "var(--hidden) var(--visible)").toJSON(),
  });
});

test(`#cascaded() returns "unset" when a var() function variable isn't defined`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--visible)",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--visible)").toJSON(),
  });
});

test(`#cascaded() returns "unset" when a var() function fallback is empty`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--visible,)",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--visible,)").toJSON(),
  });
});

test(`#cascaded() returns "unset" when declaration with a var() function is
      invalid after substitution`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--visible)",

          "--visible": "foo",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--visible)").toJSON(),
  });
});

test(`#cascaded() returns "unset" when a var() function is invalid`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "var(foo)",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() returns "unset" when var() functions contain cyclic references`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "var(--really-hidden)",
          "--really-hidden": "var(--hidden)",
        }),
      ]),
    ]
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() correctly resolves var() function references within context
      of the corresponding element`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("main", {
          "--really-hidden": "var(--hidden)",
          "--hidden": "hidden",
        }),

        // This declaration references `--really-hidden`, but inherits its value
        // from `main` above. The substitution of `--really-hidden` therefore
        // happens within context of `main` and the `--hidden` variable defined
        // for `div` will therefore not apply.
        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "var(--really-hidden)",
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
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});
