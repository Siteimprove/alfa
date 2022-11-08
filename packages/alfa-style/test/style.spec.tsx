import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Context } from "@siteimprove/alfa-selector";

import { h } from "@siteimprove/alfa-dom/h";

import { Style } from "../src/style";

import { cascaded } from "./common";

const device = Device.standard();

test("#cascaded() returns the cascaded value of a property", (t) => {
  const element = <div style={{ color: "red" }} />;

  t.deepEqual(cascaded(element, "color"), {
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

  t.deepEqual(cascaded(element, "color"), {
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

  t.deepEqual(cascaded(element, "color"), {
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

  t.deepEqual(cascaded(element, "color"), {
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

  t.deepEqual(cascaded(element, "color"), {
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

  t.deepEqual(cascaded(element, "color"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() prefers inheriting var() function over using fallback`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("main", {
          "--hidden": "var(--invalid, hidden)",
        }),

        h.rule.style("div", {
          overflowX: "var(--hidden, visible)",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow-x", "var(--hidden, visible)").toJSON(),
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow", "var(--hidden) var(--visible)").toJSON(),
  });

  t.deepEqual(cascaded(element, "overflow-y"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow", "var(--hidden) var(--hidden)").toJSON(),
  });

  t.deepEqual(cascaded(element, "overflow-y"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() returns "unset" when a custom property referenced by a var()
      function has its guaranteed-invalid initial value`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "initial",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
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

  t.deepEqual(cascaded(element, "overflow-x"), {
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
          "--foo": "var(--invalid)",
        }),

        // This declaration references `--really-hidden`, but inherits its value
        // from `main` above. The substitution of `--really-hidden` therefore
        // happens within context of `main` and the `--hidden` variable defined
        // for `div` will therefore not apply.
        h.rule.style("div", {
          overflowX: "var(--hidden)",
          "--hidden": "var(--really-hidden)",
        }),
        // This declaration references `--foo`, but inherits its value from
        // `main` above. The substitution of `--foo` therefore happens within
        // the context of `main` where it resolves to an undefined variable and
        // is thus unset. The local definition of `--invalid` does not affect
        // the parent definition of `--foo`.
        h.rule.style("div", {
          color: "var(--foo)",
          "--invalid": "red",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });

  t.deepEqual(cascaded(element, "color"), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("color", "var(--foo)").toJSON(),
  });
});

test(`#cascaded() gives precedence to !important custom properties used in var()
      function references`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          "--hidden": "hidden !important",
        }),

        h.rule.style("div", {
          overflowX: "var(--hidden)",

          "--hidden": "visible",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() does not fall back on the inherited value of a custom property
      referenced by a var() function if the first value is invalid`, (t) => {
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

          "--hidden": "initial",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--hidden)").toJSON(),
  });
});

test(`#cascaded() does not fall back on the inherited value of a custom property
      referenced by a var() function if the first value is invalid and its
      fallback is also invalid`, (t) => {
  const element = <div />;

  h.document(
    [<main>{element}</main>],
    [
      h.sheet([
        h.rule.style("main", {
          "--hidden": "hidden",
        }),

        h.rule.style("div", {
          overflowX: "var(--hidden, foo)",

          "--hidden": "initial",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "unset",
    },
    source: h.declaration("overflow-x", "var(--hidden, foo)").toJSON(),
  });
});

test(`#cascaded() accept spaces around variable name in a var() function`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          "--hidden": "hidden",
          overflowX: "var( --hidden )",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "overflow-x"), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow-x", "var( --hidden )").toJSON(),
  });
});

test(`#cascaded() resolves :hover style for an element`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          color: "red",
        }),

        h.rule.style("div:hover", {
          color: "blue",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "color", Context.hover(element)), {
    value: {
      type: "color",
      format: "named",
      color: "blue",
    },
    source: h.declaration("color", "blue").toJSON(),
  });

  t.deepEqual(cascaded(element, "color"), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red").toJSON(),
  });
});

test(`#cascaded() resolves :focus style for an element`, (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          color: "red",
        }),

        h.rule.style("div:focus", {
          color: "blue",
        }),
      ]),
    ]
  );

  t.deepEqual(cascaded(element, "color", Context.focus(element)), {
    value: {
      type: "color",
      format: "named",
      color: "blue",
    },
    source: h.declaration("color", "blue").toJSON(),
  });

  t.deepEqual(cascaded(element, "color"), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red").toJSON(),
  });
});

test(`#specified() keeps the !important flag of properties set to initial`, (t) => {
  const element = <div style={{ backgroundColor: "initial !important" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.specified("background-color").toJSON(), {
    value: {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 0 },
      green: { type: "percentage", value: 0 },
      blue: { type: "percentage", value: 0 },
      alpha: { type: "percentage", value: 0 },
    },
    source: { name: "background-color", value: "initial", important: true },
  });
});
