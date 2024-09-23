import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";

const device = Device.standard();

test("initial value is `normal`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("container-type").toJSON(), {
    value: { type: "keyword", value: "normal" },
    source: null,
  });
});

test("property is not inherited", (t) => {
  const element = <div>Hello</div>;

  h.document(
    [<div class="container">{element}</div>],
    [
      h.sheet([
        h.rule.style(".container", [h.declaration("container-type", "size")]),
      ]),
    ],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("container-type").toJSON(), {
    value: { type: "keyword", value: "normal" },
    source: null,
  });
});

test("#computed() parses the keywords", (t) => {
  for (const kw of ["normal", "size", "inline-size"] as const) {
    const element = <div class="container">Hello</div>;

    h.document(
      [element],
      [
        h.sheet([
          h.rule.style(".container", [h.declaration("container-type", kw)]),
        ]),
      ],
    );
    const style = Style.from(element, device);

    t.deepEqual(style.computed("container-type").toJSON(), {
      value: { type: "keyword", value: kw },
      source: h.declaration("container-type", kw).toJSON(),
    });
  }
});
