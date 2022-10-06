import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test(`#cascaded() parses \`border-image-repeat: round\``, (t) => {
  const element = (
    <div
      style={{
        borderImageRepeat: "round",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-repeat"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "keyword",
          value: "round",
        },
        {
          type: "keyword",
          value: "round",
        },
      ],
    },
    source: h.declaration("border-image-repeat", "round").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-repeat: round space\``, (t) => {
  const element = (
    <div
      style={{
        borderImageRepeat: "round space",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-repeat"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "keyword",
          value: "round",
        },
        {
          type: "keyword",
          value: "space",
        },
      ],
    },
    source: h.declaration("border-image-repeat", "round space").toJSON(),
  });
});
