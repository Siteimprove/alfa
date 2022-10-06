import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

for (const vertical of ["top", "bottom"] as const) {
  for (const horizontal of ["left", "right"] as const) {
    const property = `border-${vertical}-${horizontal}-radius` as const;

    test(`#cascaded() parses \`${property}: 10%\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "10%")])])]
      );

      t.deepEqual(cascaded(element, property), {
        value: {
          type: "tuple",
          values: [
            {
              type: "percentage",
              value: 0.1,
            },
            {
              type: "percentage",
              value: 0.1,
            },
          ],
        },
        source: h.declaration(property, "10%").toJSON(),
      });
    });

    test(`#cascaded() parses \`${property}: 10px 10%\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "10px 10%")])])]
      );

      t.deepEqual(cascaded(element, property), {
        value: {
          type: "tuple",
          values: [
            {
              type: "length",
              unit: "px",
              value: 10,
            },
            {
              type: "percentage",
              value: 0.1,
            },
          ],
        },
        source: h.declaration(property, "10px 10%").toJSON(),
      });
    });
  }
}

test(`#cascaded() parses \`border-radius: 1em 2em\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-radius", "1em 2em");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const corners of ["top-left", "bottom-right"] as const) {
    const property = `border-${corners}-radius` as const;

    t.deepEqual(cascaded(element, property), {
      value: {
        type: "tuple",
        values: [
          {
            type: "length",
            unit: "em",
            value: 1,
          },
          {
            type: "length",
            unit: "em",
            value: 1,
          },
        ],
      },
      source: declaration.toJSON(),
    });
  }

  for (const corners of ["bottom-left", "top-right"] as const) {
    const property = `border-${corners}-radius` as const;

    t.deepEqual(cascaded(element, property), {
      value: {
        type: "tuple",
        values: [
          {
            type: "length",
            unit: "em",
            value: 2,
          },
          {
            type: "length",
            unit: "em",
            value: 2,
          },
        ],
      },
      source: declaration.toJSON(),
    });
  }
});

test(`#cascaded() parses \`border-radius: 1em 2em / 1% 2% 3%\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-radius", "1em 2em / 1% 2% 3%");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  t.deepEqual(cascaded(element, "border-top-left-radius"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          unit: "em",
          value: 1,
        },
        {
          type: "percentage",
          value: 0.01,
        },
      ],
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, "border-top-right-radius"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          unit: "em",
          value: 2,
        },
        {
          type: "percentage",
          value: 0.02,
        },
      ],
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, "border-bottom-right-radius"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          unit: "em",
          value: 1,
        },
        {
          type: "percentage",
          value: 0.03,
        },
      ],
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, "border-bottom-left-radius"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          unit: "em",
          value: 2,
        },
        {
          type: "percentage",
          value: 0.02,
        },
      ],
    },
    source: declaration.toJSON(),
  });
});
