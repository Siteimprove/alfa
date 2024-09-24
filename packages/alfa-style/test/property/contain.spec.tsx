import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";
import { Array } from "@siteimprove/alfa-array";

const device = Device.standard();

function permutations<T>(items: Array<T>, k: number): Array<Array<T>> {
  if (k === 0) {
    return [[]];
  }

  const result = [];
  for (let i = 0; i < items.length; ++i) {
    // Recursively get permutations of length k-1 of the collection with the i-th element removed
    const lists = permutations(
      items.filter((_, j) => j !== i),
      k - 1,
    );

    // Prepend the i-th element to each sub-collection in the result of the recursion and add to result
    for (let list of lists) {
      result.push([items[i], ...list]);
    }
  }

  return result;
}

test("initial value is `none`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("contain").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});

test("property is not inherited", (t) => {
  const element = <div>Hello</div>;

  h.document(
    [<div class="container">{element}</div>],
    [
      h.sheet([
        h.rule.style(".container", [h.declaration("contain", "strict")]),
      ]),
    ],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("contain").toJSON(), {
    value: { type: "keyword", value: "none" },
    source: null,
  });
});

test("#computed() parses `none` and shorthand keywords", (t) => {
  for (const kw of ["none", "strict", "content"] as const) {
    const element = <div class="container">Hello</div>;
    const decl = h.declaration("contain", kw);
    h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
    const style = Style.from(element, device);

    t.deepEqual(style.computed("contain").toJSON(), {
      value: {
        type: "keyword",
        value: kw,
      },
      source: decl.toJSON(),
    });
  }
});

test("#computed() parses a single flag", (t) => {
  for (const flag of [
    "size",
    "inline-size",
    "layout",
    "style",
    "paint",
  ] as const) {
    const element = <div class="container">Hello</div>;
    const decl = h.declaration("contain", flag);
    h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
    const style = Style.from(element, device);

    t.deepEqual(style.computed("contain").toJSON(), {
      value: {
        type: "contain-flags",
        size: flag === "size",
        inlineSize: flag === "inline-size",
        layout: flag === "layout",
        style: flag === "style",
        paint: flag === "paint",
      },
      source: decl.toJSON(),
    });
  }
});

test("#computed() parses two flags", (t) => {
  for (const flags of [
    ...permutations(["size", "layout", "style", "paint"], 2),
    ...permutations(["inline-size", "layout", "style", "paint"], 2),
  ]) {
    const element = <div class="container">Hello</div>;

    const decl = h.declaration("contain", `${flags[0]} ${flags[1]}`);
    h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
    const style = Style.from(element, device);

    t.deepEqual(style.computed("contain").toJSON(), {
      value: {
        type: "contain-flags",
        size: flags.includes("size"),
        inlineSize: flags.includes("inline-size"),
        layout: flags.includes("layout"),
        style: flags.includes("style"),
        paint: flags.includes("paint"),
      },
      source: decl.toJSON(),
    });
  }
});

test("#computed() parses three keywords", (t) => {
  for (const flags of [
    ...permutations(["size", "layout", "style", "paint"], 3),
    ...permutations(["inline-size", "layout", "style", "paint"], 3),
  ]) {
    const element = <div class="container">Hello</div>;

    const decl = h.declaration(
      "contain",
      `${flags[0]} ${flags[1]} ${flags[2]}`,
    );
    h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
    const style = Style.from(element, device);

    t.deepEqual(style.computed("contain").toJSON(), {
      value: {
        type: "contain-flags",
        size: flags.includes("size"),
        inlineSize: flags.includes("inline-size"),
        layout: flags.includes("layout"),
        style: flags.includes("style"),
        paint: flags.includes("paint"),
      },
      source: decl.toJSON(),
    });
  }
});

test("#computed() parses four keywords", (t) => {
  for (const flags of [
    ...permutations(["size", "layout", "style", "paint"], 4),
    ...permutations(["inline-size", "layout", "style", "paint"], 4),
  ]) {
    const element = <div class="container">Hello</div>;

    const decl = h.declaration(
      "contain",
      `${flags[0]} ${flags[1]} ${flags[2]} ${flags[3]}`,
    );
    h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
    const style = Style.from(element, device);

    t.deepEqual(style.computed("contain").toJSON(), {
      value: {
        type: "contain-flags",
        size: flags.includes("size"),
        inlineSize: flags.includes("inline-size"),
        layout: flags.includes("layout"),
        style: flags.includes("style"),
        paint: flags.includes("paint"),
      },
      source: decl.toJSON(),
    });
  }
});

test("#computed() does not parse invalid keyword combinations", (t) => {
  const invalids = [
    ["strict", "content"],
    ["size", "inline-size"],
    ["strict", "layout"],
    ["none", "paint"],
    ["layout", "layout"],
  ] as const;

  for (const [fst, snd] of invalids) {
    const element = <div class="container">Hello</div>;

    h.document(
      [element],
      [
        h.sheet([
          h.rule.style(".container", [
            h.declaration("contain", `${fst} ${snd}`),
          ]),
        ]),
      ],
    );
    const style = Style.from(element, device);

    t.deepEqual(style.computed("contain").toJSON(), {
      value: {
        type: "keyword",
        value: "none",
      },
      source: null,
    });
  }
});

test("#computed() does not parse valid keyword followed by invalid keyword", (t) => {
  const element = <div class="container">Hello</div>;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style(".container", [h.declaration("contain", `layout styel`)]),
      ]),
    ],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("contain").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});
