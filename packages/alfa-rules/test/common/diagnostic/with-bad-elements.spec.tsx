import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import * as json from "@siteimprove/alfa-json";

import { WithBadElements } from "../../../dist/common/diagnostic/with-bad-elements.js";

test("toJSON() calls toJSON() on error elements", (t) => {
  const element = <div>Foo</div>;
  const diagnostic = WithBadElements.of("Foo", [element]);

  t.deepEqual(diagnostic.toJSON(), {
    message: "Foo",
    errors: [element.toJSON()],
  });
});

test("toJSON() calls toJSON() on error elements and respects serialization options", (t) => {
  const internalId = "some id";
  const element = h.element(
    "div",
    undefined,
    [h.text("Foo")],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    internalId,
  );
  const diagnostic = WithBadElements.of("Foo", [element]);

  t.deepEqual(
    diagnostic.toJSON({
      device: Device.standard(),
      verbosity: json.Serializable.Verbosity.Minimal,
    }),
    {
      message: "Foo",
      errors: [
        // @ts-ignore the type checker is not able to infer that the type should be Element.MinimalJSON when the serialization options are passed through WithBadElements.toJSON
        {
          type: "element",
          internalId,
          serializationId: internalId,
        },
      ],
    },
  );
});
