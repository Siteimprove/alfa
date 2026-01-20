import { CSS4Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom/h";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import { test } from "@siteimprove/alfa-test";

import {
  getBackground,
  getForeground,
} from "../../../dist/common/dom/get-colors.js";

const device = Device.standard();

function color(r: number, g: number, b: number): CSS4Color.JSON {
  return {
    type: "color",
    space: "srgb",
    coordinates: [r, g, b],
    sRGB: [
      { type: "percentage", value: r },
      { type: "percentage", value: g },
      { type: "percentage", value: b },
    ],
    alpha: { type: "percentage", value: 1 },
  };
}

const red = color(1, 0, 0);
const blue = color(0, 0, 1);
const black = color(0, 0, 0);
const white = color(1, 1, 1);

test("getBackground() handles opacity correctly", (t) => {
  const target = (
    <span
      style={{ backgroundColor: "#005BBB", color: "white", opacity: "0.4" }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div style={{ backgroundColor: "white" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    getBackground(target, device).getUnsafe()[0].toJSON(),
    color(0.6, 0.7427451, 0.8933333),
  );
});

test("getBackground() handles mix of opacity and transparency", (t) => {
  const target = (
    <span
      style={{
        backgroundColor: "rgba(0, 0, 255, .5)",
        color: "white",
        opacity: "0.5",
      }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div style={{ backgroundColor: "red" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    getBackground(target, device).getUnsafe()[0].toJSON(),
    color(0.75, 0, 0.25),
  );
});

test("getBackground() handles linear-gradient background", (t) => {
  const target = (
    <span
      style={{
        backgroundImage:
          "linear-gradient(to right, red 20%, orange 40%, yellow 60%, green 80%, blue 100%)",
      }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div>{target}</div>
    </html>,
  ]);

  t.deepEqual(getBackground(target, device).getUnsafe()[0].toJSON(), red);

  t.deepEqual(getBackground(target, device).getUnsafe()[4].toJSON(), blue);
});

test("getForeground() handles opacity correctly", (t) => {
  const target = (
    <span
      style={{ backgroundColor: "#005BBB", color: "white", opacity: "0.4" }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div style={{ backgroundColor: "white" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(getForeground(target, device).getUnsafe()[0].toJSON(), white);
});

test("getForeground() handles mix of opacity and transparency", (t) => {
  const target = (
    <span
      style={{
        backgroundColor: "blue",
        color: "rgba(255, 255, 255, .5)",
        opacity: "0.5",
      }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div style={{ backgroundColor: "red" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    getForeground(target, device).getUnsafe()[0].toJSON(),
    color(0.75, 0.25, 0.5),
  );
});

test("getForeground() handles hover context", (t) => {
  const target = <a href="#">Link</a>;

  h.document(
    [target],
    [
      h.sheet([
        h.rule.style("a:hover", {
          color: "red",
        }),
      ]),
    ],
  );

  t.deepEqual(
    getForeground(target, device, Context.hover(target))
      .getUnsafe()[0]
      .toJSON(),
    red,
  );
});

test("getForeground() returns the non-hover color", (t) => {
  const target = <a href="#">Link</a>;

  h.document(
    [target],
    [
      h.sheet([
        h.rule.style("a", {
          color: "red",
        }),
      ]),
    ],
  );

  t.deepEqual(
    getForeground(target, device, Context.hover(target))
      .getUnsafe()[0]
      .toJSON(),
    red,
  );
});

test("getForeground() handles hover context with a mix of opacity and transparency", (t) => {
  const target = <a href="#">Link</a>;

  h.document(
    [
      <html>
        <div style={{ backgroundColor: "red" }}>{target}</div>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a:hover", {
          backgroundColor: "blue",
          color: "rgba(255, 255, 255, .5)",
          opacity: "0.5",
        }),
      ]),
    ],
  );

  t.deepEqual(
    getForeground(target, device, Context.hover(target))
      .getUnsafe()[0]
      .toJSON(),
    color(0.75, 0.25, 0.5),
  );
});

test("getForeground() handles a mix of opacity and transparency and a linear gradient background", (t) => {
  const target = <a href="#">Link</a>;

  h.document(
    [
      <html>
        <div
          style={{
            backgroundColor: "blue",
          }}
        >
          {target}
        </div>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          background:
            "linear-gradient(to right, red 20%, orange 40%, yellow 60%, green 80%, blue 100%)",
          color: "rgba(255, 255, 255, .5)",
          opacity: "0.5",
        }),
      ]),
    ],
  );

  t.deepEqual(
    getForeground(target, device).getUnsafe()[0].toJSON(),
    color(0.5, 0.25, 0.75),
  );

  t.deepEqual(
    getForeground(target, device).getUnsafe()[4].toJSON(),
    color(0.25, 0.25, 1),
  );
});

test("getForeground() resolves `currentcolor` when color is set on parent", (t) => {
  const target = <div>Content</div>;

  h.document(
    [
      <html>
        <div class="blue">
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div>{target}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          color: "currentcolor",
        }),
        h.rule.style(".blue", {
          color: "blue",
        }),
      ]),
    ],
  );

  t.deepEqual(getForeground(target, device).getUnsafe()[0].toJSON(), blue);
});

test("getForeground() resolves `currentcolor` when color is set to initial on parent", (t) => {
  const target = <p>Content</p>;

  h.document(
    [<html>{target}</html>],
    [
      h.sheet([
        h.rule.style("p", {
          color: "currentcolor",
        }),
      ]),
    ],
  );

  t.deepEqual(getForeground(target, device).getUnsafe()[0].toJSON(), black);
});

test("getForeground() resolves `currentcolor` when color is set with opacity on the parent", (t) => {
  const target = <span>Hello</span>;

  h.document(
    [
      <html>
        <div>{target}</div>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("span", {
          color: "currentcolor",
        }),
        h.rule.style("div", {
          color: "blue",
          opacity: "0.5",
        }),
      ]),
    ],
  );

  t.deepEqual(
    getForeground(target, device).getUnsafe()[0].toJSON(),
    color(0.5, 0.5, 1),
  );
});

test("getColor() can't resolve most system colors", (t) => {
  const target = <span>Hello</span>;
  const wrapper = <div>{target}</div>;

  h.document(
    [wrapper],
    [
      h.sheet([
        h.rule.style("span", {
          color: "visitedtext",
        }),
        h.rule.style("div", {
          backgroundColor: "buttonface",
        }),
      ]),
    ],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "Could not resolve background-color",
          element: wrapper.toJSON(),
          type: "layer",
          kind: "unresolvable-background-color",
          property: "background-color",
          value: { type: "keyword", value: "buttonface" },
        },
      ],
    },
  });

  t.deepEqual(getForeground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "Could not resolve foreground color",
          type: "foreground",
          kind: "unresolvable-foreground-color",
          element: target.toJSON(),
          property: "color",
          value: { type: "keyword", value: "visitedtext" },
        },
        {
          message: "Could not resolve background-color",
          element: wrapper.toJSON(),
          type: "layer",
          kind: "unresolvable-background-color",
          property: "background-color",
          value: { type: "keyword", value: "buttonface" },
        },
      ],
    },
  });
});

test("getBackgroundColor() gives up in case of external background image", (t) => {
  const target = <div>Hello</div>;

  h.document(
    [target],
    [h.sheet([h.rule.style("div", { backgroundImage: "url(foo.jpg)" })])],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "A background-image with a url() was encountered",
          type: "layer",
          kind: "background-image",
          element: target.toJSON(),
          property: "background-image",
          value: {
            type: "list",
            separator: ", ",
            values: [
              {
                image: {
                  type: "url",
                  url: "foo.jpg",
                },
                type: "image",
              },
            ],
          },
        },
      ],
    },
  });
});

test("getBackgroundColor() gives up in case of sized background image", (t) => {
  const target = <div id="debug">Hello</div>;

  h.document(
    [target],
    [
      h.sheet([
        h.rule.style("div", {
          backgroundImage: "linear-gradient(to right, red, blue)",
          backgroundSize: "100% 2px",
          backgroundRepeat: "no-repeat",
        }),
      ]),
    ],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "A background-size was encountered",
          type: "layer",
          kind: "background-size",
          element: target.toJSON(),
          property: "background-size",
          value: {
            separator: ", ",
            type: "list",
            values: [
              {
                type: "tuple",
                values: [
                  {
                    type: "percentage",
                    value: 1,
                  },
                  {
                    type: "length",
                    unit: "px",
                    value: 2,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  });
});

test("getBackgroundColor() gives up in case of text $dow", (t) => {
  const target = <div>Hello</div>;

  h.document(
    [target],
    [h.sheet([h.rule.style("div", { textShadow: "1px 1px 2px red" })])],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "A text-shadow was encountered",
          type: "background",
          kind: "text-shadow",
          element: target.toJSON(),
          property: "text-shadow",
          value: {
            type: "list",
            values: [
              {
                blur: { type: "length", unit: "px", value: 2 },
                color: red,
                horizontal: { type: "length", unit: "px", value: 1 },
                isInset: false,
                spread: { type: "length", unit: "px", value: 0 },
                type: "shadow",
                vertical: { type: "length", unit: "px", value: 1 },
              },
            ],
            separator: ", ",
          },
        },
      ],
    },
  });
});

test("getBackgroundColor() ignores `text-shadow: 0px 0px 0px;`", (t) => {
  const target = <div>Hello</div>;

  h.document(
    [target],
    [h.sheet([h.rule.style("div", { textShadow: "0px 0px 0px" })])],
  );

  t.deepEqual(getBackground(target, device).getUnsafe()[0].toJSON(), white);
});

test("getBackgroundColor() ignores transparent text-shadow", (t) => {
  const target = <div>Hello</div>;

  h.document(
    [target],
    [h.sheet([h.rule.style("div", { textShadow: "1px 2px 3px transparent" })])],
  );

  t.deepEqual(getBackground(target, device).getUnsafe()[0].toJSON(), white);
});

test("getBackgroundColor() cannot handle positioned elements", (t) => {
  const target = <span>Hello</span>;
  const wrapper = (
    <p>
      <div></div>
      {target}
    </p>
  );

  h.document(
    [wrapper],
    [
      h.sheet([
        h.rule.style("div", { backgroundColor: "blue" }),
        h.rule.style("span", { position: "absolute", top: "1px" }),
        h.rule.style("p", { position: "relative" }),
      ]),
    ],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "A non-statically positioned element was encountered",
          type: "layer",
          kind: "non-static",
          element: target.toJSON(),
          property: "position",
          value: { type: "keyword", value: "absolute" },
        },
      ],
    },
  });
});

test("getBackgroundColor() cannot resolve system colors in gradients", (t) => {
  const target = <div>Hello</div>;

  h.document(
    [target],
    [
      h.sheet([
        h.rule.style("div", {
          backgroundImage: "linear-gradient(red, highlight)",
        }),
      ]),
    ],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "Could not resolve gradient color stop",
          type: "layer",
          kind: "unresolvable-gradient",
          element: target.toJSON(),
          property: "background-image",
          value: {
            separator: ", ",
            type: "list",
            values: [
              {
                image: {
                  direction: { side: "bottom", type: "side" },
                  items: [
                    { color: red, position: null, type: "stop" },
                    {
                      color: { type: "keyword", value: "highlight" },
                      position: null,
                      type: "stop",
                    },
                  ],
                  kind: "linear",
                  repeats: false,
                  type: "gradient",
                },
                type: "image",
              },
            ],
          },
          color: { type: "keyword", value: "highlight" },
        },
      ],
    },
  });
});

test("getBackgroundColor() gives up in case of  non-ignored interposed elements", (t) => {
  const target = <span>Hello</span>;
  const interposed = <div></div>;
  const wrapper = (
    <p>
      {interposed}
      {target}
    </p>
  );

  h.document(
    [wrapper],
    [
      h.sheet([
        h.rule.style("div", {
          backgroundColor: "blue",
          position: "absolute",
          top: "1px",
          bottom: "1px",
          left: "1px",
          right: "1px",
        }),
        h.rule.style("p", { position: "relative" }),
      ]),
    ],
  );

  t.deepEqual(getBackground(target, device).toJSON(), {
    type: "err",
    error: {
      message: "Could not fully resolve colors",
      errors: [
        {
          message: "An interposed descendant element was encountered",
          type: "layer",
          kind: "interposed-descendant",
          element: wrapper.toJSON(),
          positionedDescendants: [interposed.toJSON()],
        },
      ],
    },
  });

  t.deepEqual(
    getBackground(target, device, undefined, undefined, Set.of(interposed))
      .getUnsafe()[0]
      .toJSON(),
    white,
  );
});

test("getBackgroundColor() ignores external background image with invalid URL", (t) => {
  const target = <div>Hello</div>;

  h.document(
    [target],
    [h.sheet([h.rule.style("div", { backgroundImage: "url()" })])],
  );

  // We get the default white background
  t.deepEqual(getBackground(target, device).getUnsafe()[0].toJSON(), white);
});
