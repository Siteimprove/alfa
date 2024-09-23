import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";

const device = Device.standard();

test("initial value is `auto`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("isolation").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("property is not inherited", (t) => {
  const element = <div>Hello</div>;

  h.document(
    [<div class="container">{element}</div>],
    [
      h.sheet([
        h.rule.style(".container", [h.declaration("isolation", "isolate")]),
      ]),
    ],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("isolation").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed() parses the keywords", (t) => {
  for (const kw of ["auto", "isolate"] as const) {
    const element = <div class="container">Hello</div>;

    h.document(
      [element],
      [h.sheet([h.rule.style(".container", [h.declaration("isolation", kw)])])],
    );
    const style = Style.from(element, device);

    t.deepEqual(style.computed("isolation").toJSON(), {
      value: { type: "keyword", value: kw },
      source: h.declaration("isolation", kw).toJSON(),
    });
  }
});
