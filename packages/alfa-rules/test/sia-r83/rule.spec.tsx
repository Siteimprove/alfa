import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R83, { Outcomes } from "../../src/sia-r83/rule";

import { Device } from "@siteimprove/alfa-device";
import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test("evaluate() passes a text node that truncates overflow using ellipsis", async (t) => {
  const target = h.text("Hello world");

  const document = h.document(
    [
      <body>
        <div>{target}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() passes a text node that is non-statically positioned with a
      clipping ancestor which is not the offset parent`, async (t) => {
  const target = h.text("Hello world");

  const document = h.document(
    [
      <body>
        <div class="clipping">
          <div class="absolute">{target}</div>
        </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style(".clipping", {
          overflow: "hidden",
          height: "28px",
        }),
        h.rule.style(".absolute", {
          position: "absolute",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() passes a text node with a fixed absolute height set
      via the style attribute`, async (t) => {
  const target = h.text("Hello world");

  const document = h.document(
    [
      <body>
        <div
          style={{
            height: "20px",
          }}
        >
          {target}
        </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes a text node with a fixed relative height`, async (t) => {
  const target = h.text("Hello world");

  const document = h.document(
    [
      <body>
        <div>{target}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "1.2em",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes a text node that resets the white-space
      property of its clipping ancestor`, async (t) => {
  {
    const target = h.text("Hello world");

    const document = h.document(
      [
        <body>
          <p>
            <span>{target}</span>
          </p>
        </body>,
      ],
      [
        h.sheet([
          h.rule.style("p", {
            overflowX: "hidden",
            whiteSpace: "nowrap",
          }),

          h.rule.style("span", {
            whiteSpace: "normal",
          }),
        ]),
      ],
    );

    t.deepEqual(await evaluate(R83, { document }), [
      passed(R83, target, { 1: Outcomes.WrapsText }),
    ]);
  }
});

test(`evaluate() passes a text node with a scrolling ancestor inside a clipping one`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div class="clipping">
          <div class="scrolling">{target}</div>
        </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style(".clipping", { overflowY: "hidden", height: "10px" }),
        h.rule.style(".scrolling", { overflowY: "scroll", height: "10px" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes texts in a wrapping flex container`, async (t) => {
  const target1 = h.text("Hello");
  const target2 = h.text("World");

  const document = h.document(
    [
      <body>
        <div class="clip">
          <div class="flex">
            <span>{target1}</span> <span>{target2}</span>
          </div>
        </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("span", { whiteSpace: "nowrap" }),
        h.rule.style(".clip", { overflowX: "hidden" }),
        h.rule.style(".flex", { display: "flex", flexWrap: "wrap" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target1, { 1: Outcomes.WrapsText }),
    passed(R83, target2, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluates() passes a clipping element with font-relative height`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div class="growing">{target}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style(".growing", {
          overflowY: "hidden",
          minHeight: "1.5em",
          height: "10px",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluates() passes a clipping element with font-relative width`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div class="growing">{target}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style(".growing", {
          overflowX: "hidden",
          minWidth: "15em",
          width: "10px",
          whiteSpace: "nowrap",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes a relatively positioned node with a handling static parent`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div class="relative clipping">
          <div class="handle">
            <span class="relative content">{target}</span>
          </div>
        </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style(".relative", { position: "relative" }),
        h.rule.style(".clipping", { overflowX: "hidden" }),
        h.rule.style(".handle", { overflowX: "scroll" }),
        h.rule.style(".content", { whiteSpace: "nowrap" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluates() checks wrapping of text nodes individually`, async (t) => {
  const target1 = h.text("I have non-wrapped text and I clip");
  const target2 = h.text("I do not clip because I wrap");

  const div1 = <div class="nowrap">{target1}</div>;
  const div2 = <div class="wrap">{target2}</div>;

  const clipping = (
    <div class="possibly-clipping">
      {div1}
      {div2}
    </div>
  );

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style(".possibly-clipping", { overflowX: "hidden" }),
        h.rule.style(".nowrap", {
          whiteSpace: "nowrap",
          textOverflow: "clip",
        }),
        h.rule.style(".wrap", { whiteSpace: "normal" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target1, { 1: Outcomes.ClipsText(Option.of(clipping), None) }),
    passed(R83, target2, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes text in <option> within a multi-line <select> element`, async (t) => {
  const target1 = h.text("First");
  const target2 = h.text("Second");
  const target3 = h.text("Super long text, I want that to be really huge");
  const document = h.document(
    [
      <body>
        <select size="3">
          <option value="Foo">{target1}</option>
          <option value="Bar">{target2}</option>
          <option value="Baz">{target3}</option>
        </select>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("select", {
          width: "20px",
          overflow: "hidden",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target1, { 1: Outcomes.WrapsText }),
    passed(R83, target2, { 1: Outcomes.WrapsText }),
    passed(R83, target3, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes text in <option> within a <select> with a \`multiple\` attribute`, async (t) => {
  const target1 = h.text("First");
  const target2 = h.text("Second");
  const target3 = h.text("Super long text, I want that to be really huge");
  const document = h.document(
    [
      <body>
        <select multiple>
          <option value="Foo">{target1}</option>
          <option value="Bar">{target2}</option>
          <option value="Baz">{target3}</option>
        </select>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("select", {
          width: "20px",
          overflow: "hidden",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target1, { 1: Outcomes.WrapsText }),
    passed(R83, target2, { 1: Outcomes.WrapsText }),
    passed(R83, target3, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes a text node with fixed height set by a font-relative
      height media query`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div>{target}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.media("(min-height: 10em)", [
          h.rule.style("div", { height: "10px", overflow: "hidden" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes a text node with horizontal wrapping set by a font-relative
      width media query`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div>{target}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.media("(min-width: 10em)", [
          h.rule.style("div", {
            overflow: "hidden",
            whiteSpace: "nowrap",
          }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluate() passes a text node with fixed height and another property
      set by a font-relative height media query`, async (t) => {
  const target = h.text("Hello World");

  const document = h.document(
    [
      <body>
        <div>
          <span>{target}</span>
        </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("span", { height: "10px", overflow: "hidden" }),
        h.rule.media("(min-height: 10em)", [
          h.rule.style("span", { color: "red" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, { 1: Outcomes.WrapsText }),
  ]);
});

test(`evaluates() passes a text node horizontally overflowing its small
      parent and not clipped by its wide grand-parent`, async (t) => {
  const target = h.text("Hello world");
  const device = Device.standard();

  const clipping = (
    <div box={{ device, x: 0, y: 0, width: 200, height: 40 }}>
      <span box={{ device, x: 10, y: 10, width: 50, height: 20 }}>
        {target}
      </span>
    </div>
  );

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }),
      ]),
    ],
  );
  t.deepEqual(await evaluate(R83, { document, device }), [
    passed(R83, target, {
      1: Outcomes.IsContainer(Option.of(clipping), None),
    }),
  ]);
});

test(`evaluate() passes a text node vertically overflowing its small
      parent and not clipped by its high grand-parent`, async (t) => {
  const target = h.text("Hello world");
  const device = Device.standard();

  const clipping = (
    <div box={{ device, x: 0, y: 0, width: 200, height: 40 }}>
      <span box={{ device, x: 10, y: 10, width: 50, height: 20 }}>
        {target}
      </span>
    </div>
  );

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "20px",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document, device }), [
    passed(R83, target, {
      1: Outcomes.IsContainer(None, Option.of(clipping)),
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow by not wrapping text
      using the \`white-space\` property`, async (t) => {
  const target = h.text("Hello world");
  const clipping = <div>{target}</div>;

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText(Option.of(clipping), None),
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow and sets a fixed height
      using the px unit`, async (t) => {
  const target = h.text("Hello world");
  const clipping = <div>{target}</div>;

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "20px",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText(None, Option.of(clipping)),
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow and sets a fixed height
      using the vh unit`, async (t) => {
  const target = h.text("Hello world");
  const clipping = <div>{target}</div>;

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "1vh",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText(None, Option.of(clipping)),
    }),
  ]);
});

test(`evaluate() fails a text node that is non-statically positioned with a
      clipping offset parent`, async (t) => {
  const target = h.text("Hello world");
  const clipping = (
    <div class="clipping">
      <div class="absolute">{target}</div>
    </div>
  );

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style(".clipping", {
          overflow: "hidden",
          position: "relative",
          height: "28px",
        }),
        h.rule.style(".absolute", {
          position: "absolute",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText(None, Option.of(clipping)),
    }),
  ]);
});

test(`evaluates() fails a text node overflowing its parent as text and clipped
      by its grand-parent as content`, async (t) => {
  const target = h.text("Hello world");
  const clipping = (
    <div>
      <span>{target}</span>
    </div>
  );

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }),
      ]),
    ],
  );
  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText(Option.of(clipping), None),
    }),
  ]);
});

test(`evaluate() fails a text node that is vertically clipped but horizontally wrapped`, async (t) => {
  const target = h.text("Hello world");
  const clipping = <div>{target}</div>;

  const document = h.document(
    [<body>{clipping}</body>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "20px",
          whiteSpace: "normal",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText(None, Option.of(clipping)),
    }),
  ]);
});

test(`evaluate() fails a relatively positioned node clipped by a static parent`, async (t) => {
  const target = h.text("Hello World");
  const clipping = (
    <div class="clipping">
      <span class="relative">{target}</span>
    </div>
  );

  const document = h.document(
    [
      <body>
        <div class="relative">{clipping}</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style(".relative", { position: "relative", left: "100px" }),
        h.rule.style(".clipping", { height: "5px", overflowY: "hidden" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, { 1: Outcomes.ClipsText(None, Option.of(clipping)) }),
  ]);
});

test(`evaluate() fails a text node with fixed height set by a font-relative
      width media query`, async (t) => {
  const target = h.text("Hello World");
  const clipper = <div>{target}</div>;

  const document = h.document(
    [<body>{clipper}</body>],
    [
      h.sheet([
        h.rule.media("(min-width: 10em)", [
          h.rule.style("div", { height: "10px", overflow: "hidden" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, { 1: Outcomes.ClipsText(None, Option.of(clipper)) }),
  ]);
});

test(`evaluate() fails a text node with horizontal wrapping set by a font-relative
      height media query`, async (t) => {
  const target = h.text("Hello World");
  const clipper = <div>{target}</div>;

  const document = h.document(
    [<body>{clipper}</body>],
    [
      h.sheet([
        h.rule.media("(min-height: 10em)", [
          h.rule.style("div", {
            overflow: "hidden",
            whiteSpace: "nowrap",
          }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, { 1: Outcomes.ClipsText(Option.of(clipper), None) }),
  ]);
});

test("evaluate() is inapplicable to a text node that is not visible", async (t) => {
  const document = h.document(
    [
      <body>
        <div hidden>Hello world</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node that is excluded from the
      accessibility tree using the \`aria-hidden\` attribute`, async (t) => {
  const document = h.document(
    [
      <body>
        <div aria-hidden="true">Hello world</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to text in <option> within a single line <select> element`, async (t) => {
  const document = h.document(
    [
      <body>
        <select size="1">
          <option value="Foo">First</option>
          <option value="Bar">Second</option>
          <option value="Baz">
            Super long text, I want that to be really huge
          </option>
        </select>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("select", {
          width: "20px",
          overflow: "hidden",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node that would clip if it was non-
      empty`, async (t) => {
  const document = h.document(
    [
      <body>
        <div> </div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() ignores overflow on \`<body\`> element`, async (t) => {
  const document = h.document(
    [
      <body>
        <div>Hello World</div>
      </body>,
    ],
    [
      h.sheet([
        h.rule.style("body", { overflow: "hidden" }),
        h.rule.style("div", { whiteSpace: "nowrap" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});
