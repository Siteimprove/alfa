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

test(`#cascaded() expands several var() function references to the same variable`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "var(--hidden) var(--hidden)",

          "--hidden": "hidden",
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
    source: h.declaration("overflow", "var(--hidden) var(--hidden)").toJSON(),
  });

  t.deepEqual(style.cascaded("overflow-y").get().toJSON(), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow", "var(--hidden) var(--hidden)").toJSON(),
  });
});

test(`#cascaded() expands a var() function with a fallback with a var() function
      with a fallback`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--foo, var(--bar, hidden))",
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
    source: h
      .declaration("overflow-x", "var(--foo, var(--bar, hidden))")
      .toJSON(),
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

test(`#cascaded() returns "unset" when confronted with a billion laughs`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--prop30)",

          "--prop1": "lol",
          "--prop2": "var(--prop1) var(--prop1)",
          "--prop3": "var(--prop2) var(--prop2)",
          "--prop4": "var(--prop3) var(--prop3)",
          "--prop5": "var(--prop4) var(--prop4)",
          "--prop6": "var(--prop5) var(--prop5)",
          "--prop7": "var(--prop6) var(--prop6)",
          "--prop8": "var(--prop7) var(--prop7)",
          "--prop9": "var(--prop8) var(--prop8)",
          "--prop10": "var(--prop9) var(--prop9)",
          "--prop11": "var(--prop10) var(--prop10)",
          "--prop12": "var(--prop11) var(--prop11)",
          "--prop13": "var(--prop12) var(--prop12)",
          "--prop14": "var(--prop13) var(--prop13)",
          "--prop15": "var(--prop14) var(--prop14)",
          "--prop16": "var(--prop15) var(--prop15)",
          "--prop17": "var(--prop16) var(--prop16)",
          "--prop18": "var(--prop17) var(--prop17)",
          "--prop19": "var(--prop18) var(--prop18)",
          "--prop20": "var(--prop19) var(--prop19)",
          "--prop21": "var(--prop20) var(--prop20)",
          "--prop22": "var(--prop21) var(--prop21)",
          "--prop23": "var(--prop22) var(--prop22)",
          "--prop24": "var(--prop23) var(--prop23)",
          "--prop25": "var(--prop24) var(--prop24)",
          "--prop26": "var(--prop25) var(--prop25)",
          "--prop27": "var(--prop26) var(--prop26)",
          "--prop28": "var(--prop27) var(--prop27)",
          "--prop29": "var(--prop28) var(--prop28)",
          "--prop30": "var(--prop29) var(--prop29)",
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
    source: h.declaration("overflow-x", "var(--prop30)").toJSON(),
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
