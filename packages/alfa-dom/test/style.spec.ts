import { test } from "@siteimprove/alfa-test";

import { h } from "../dist/index.js";

test("Sheet.of assigns owner to descendants of condition rules", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const sheet = h.sheet([
    h.rule.supports("foo", [h.rule.media("screen", [rule])]),
  ]);

  t.equal(rule.owner.getUnsafe(), sheet);
});

test("#toJSON serializes imported sheets", (t) => {
  const importedSheet = h.sheet([
    h.rule.style("p", { background: "aliceblue" }),
  ]);
  const sheet = h.sheet([h.rule.importRule("foo.css", importedSheet)]);

  t.deepEqual(sheet.toJSON(), {
    rules: [
      {
        type: "import",
        condition: "all",
        href: "foo.css",
        layer: null,
        rules: [
          {
            type: "style",
            selector: "p",
            style: [
              {
                important: false,
                name: "background",
                value: "aliceblue",
              },
            ],
          },
        ],
        supportText: null,
      },
    ],
    disabled: false,
    condition: null,
  });
});
