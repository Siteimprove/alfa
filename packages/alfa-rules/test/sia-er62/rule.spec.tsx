import { h } from "@siteimprove/alfa-dom";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import ER62, { ComputedStyles, Outcomes } from "../../src/sia-er62/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";
// default styling of links
// The initial value of border-top is medium, resolving as 3px. However, when
// computing and border-style is none, this is computed as 0px.
// As a consequence, even without changing `border` at all, the computed value
// of border-top is not equal to its initial value and needs to expressed here!
//
// Confused? Wait, same joke happens for outline-width except that now on focus
// outline-style is not none, so the computed value of outline-width is its
// initial value. As a consequence, we cannot just override properties since
// in this case we need to actually *remove* outline-width from the diagnostic!
const noDistinguishingProperties = ComputedStyles.of([
  ["border-width", "0px"],
  ["font", "16px serif"],
  ["color", "rgb(0% 0% 93.33333%)"],
  ["outline", "0px"],
]);

const linkProperties = noDistinguishingProperties.with([
  "text-decoration",
  "underline",
]);
function addCursor(style: Result<ComputedStyles>): Result<ComputedStyles> {
  return (style.isOk() ? style : Ok.of(style.getErr())).map((props) =>
    props.with(["cursor", "pointer"])
  );
}
function addOutline(style: Result<ComputedStyles>): Result<ComputedStyles> {
  return (style.isOk() ? style : Ok.of(style.getErr())).map((props) =>
    props.with(["outline", "auto"])
  );
}

const defaultStyle = Ok.of(linkProperties);
const hoverStyle = addCursor(defaultStyle);
const focusStyle = addOutline(defaultStyle);

const noStyle = Err.of(noDistinguishingProperties);

/******************************************************************
 *
 * Passing tests
 *
 ******************************************************************/
test(`evaluate() passes an <a> element with a <p> parent element with non-link
      text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() passes an <a> element with a <p> parent element with non-link
      text content in a <span> child element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <p>
      <span>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and instead applies a bottom border`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          borderBottom: "1px solid #000",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(
      ["border-width", "0px 0px 1px"],
      ["border-style", "none none solid"],
      ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"],
      ["outline", "0px"]
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and instead applies an outline`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          outline: "auto",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    ComputedStyles.of([
      ["border-width", "0px"],
      ["font", "16px serif"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["outline", "auto"],
    ])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([style], [addCursor(style)], [style]),
    }),
  ]);
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and instead applies a background color`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          background: "red",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(["background", "rgb(100% 0% 0%)"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluate() passes an <a> element with a <div role="paragraph"> parent element
      with non-link text content in a <span> child element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <div role="paragraph">
      <span>Hello</span> {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() passes a link whose bolder than surrounding text`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span>Hello</span> {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          fontWeight: "bold",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(["font", "700 16px serif"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluates() passes on link with a different background-image than text`, async (t) => {
  const target = <a href="#">Foo</a>;

  const document = h.document(
    [<p>Hello world {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          backgroundImage:
            "linear-gradient(to right, #046B99 50%, transparent 50%)",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with([
      "background",
      "linear-gradient(to right, rgb(1.56863% 41.96078% 60%) 50%, rgb(0% 0% 0% / 0%) 50%)",
    ])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluate() passes an <a> element in superscript`, async (t) => {
  const target = (
    <a href="#">
      <sup>Link</sup>
    </a>
  );

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(["vertical-align", "super"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style, noStyle],
        [addCursor(noStyle), addCursor(style)],
        [style, addOutline(noStyle)]
      ),
    }),
  ]);
});

test(`evaluate() passes a link with different font-family than surrounding text`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span>Hello</span> {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          font: '16px "some-font", serif',
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(["font", '16px "some-font", serif'])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluates() accepts decoration on children of links`, async (t) => {
  const target = (
    <a href="#">
      <span>Link</span>
    </a>
  );

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          cursor: "auto",
        }),
        h.rule.style("a:focus", { outline: "none" }),
        h.rule.style("span", { fontWeight: "bold" }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(["font", "700 16px serif"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style, noStyle],
        [style, noStyle],
        [style, noStyle]
      ),
    }),
  ]);
});

test(`evaluates() doesn't break when link text is nested`, async (t) => {
  // Since text-decoration and focus outline is not inherited, the <span> has
  // effectively no style other than color.
  const target = (
    <a href="#">
      <span>Link</span>
    </a>
  );

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle, noStyle],
        [addCursor(noStyle), hoverStyle],
        [focusStyle, noStyle]
      ),
    }),
  ]);
});

test(`evaluates() accepts decoration on parents of links`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        Hello <span>{target}</span>
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          cursor: "auto",
        }),
        h.rule.style("a:focus", {
          outline: "none",
        }),
        h.rule.style("span", { fontWeight: "bold" }),
      ]),
    ]
  );

  const linkStyle = Ok.of(
    noDistinguishingProperties.with(["font", "700 16px serif"])
  );
  const spanStyle = Ok.of(
    ComputedStyles.of([
      ["border-width", "0px"],
      ["font", "700 16px serif"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [spanStyle, linkStyle],
        [spanStyle, linkStyle],
        [spanStyle, linkStyle]
      ),
    }),
  ]);
});

test(`evaluates() deduplicate styles in diagnostic`, async (t) => {
  const target = (
    <a href="#">
      <span>click</span> <span>here</span>
    </a>
  );

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle, noStyle],
        [addCursor(noStyle), hoverStyle],
        [focusStyle, noStyle]
      ),
    }),
  ]);
});

test(`evaluates() passes on link with a different background-image than text`, async (t) => {
  const target = <a href="#">Foo</a>;

  const document = h.document(
    [<p>Hello world {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          backgroundImage:
            "linear-gradient(to right, #046B99 50%, transparent 50%)",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with([
      "background",
      "linear-gradient(to right, rgb(1.56863% 41.96078% 60%) 50%, rgb(0% 0% 0% / 0%) 50%)",
    ])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluate() passes an <a> element in superscript`, async (t) => {
  const target = (
    <a href="#">
      <sup>Link</sup>
    </a>
  );

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties.with(["vertical-align", "super"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style, noStyle],
        [addCursor(noStyle), addCursor(style)],
        [style, addOutline(noStyle)]
      ),
    }),
  ]);
});

/******************************************************************
 *
 * Failing tests
 *
 ******************************************************************/
test(`evaluate() fails an <a> element that removes the default text decoration
      without replacing it with another distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          outline: "none",
          textDecoration: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      on hover without replacing it with another distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:hover", {
          textDecoration: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([defaultStyle], [noStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      and focus outline on focus without replacing them with another
      distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([defaultStyle], [hoverStyle], [noStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      and focus outline on hover and focus without replacing them with another
      distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:hover, a:focus", {
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([defaultStyle], [noStyle], [noStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that applies a text decoration only on
      hover`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          outline: "none",
          textDecoration: "none",
          cursor: "auto",
        }),

        h.rule.style("a:hover", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [defaultStyle], [noStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that applies a text decoration only on
      focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          outline: "none",
          textDecoration: "none",
          cursor: "auto",
        }),

        h.rule.style("a:focus", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [defaultStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that applies a text decoration only on
      hover and focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          outline: "none",
          textDecoration: "none",
          cursor: "auto",
        }),

        h.rule.style("a:hover, a:focus", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable(
        [noStyle],
        [defaultStyle],
        [defaultStyle]
      ),
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and
      has a transparent bottom border`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          borderBottom: "1px solid transparent",
        }),
      ]),
    ]
  );

  const style = Err.of(
    noDistinguishingProperties.with(
      ["border-width", "0px 0px 1px"],
      ["border-style", "none none solid"],
      ["border-color", "currentcolor currentcolor rgb(0% 0% 0% / 0%)"]
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and
      has a 0px bottom border`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          borderBottom: "0px solid #000",
        }),
      ]),
    ]
  );

  const style = Err.of(
    noDistinguishingProperties.with(
      ["border-width", "0px"],
      ["border-style", "none none solid"],
      ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"]
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and is
      part of a paragraph with a background color`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          background: "red",
        }),

        h.rule.style("a", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable(
        [noStyle],
        [addCursor(noStyle)],
        [addOutline(noStyle)]
      ),
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and
      has a background color equal to that of the paragraph`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          background: "red",
        }),

        h.rule.style("a", {
          textDecoration: "none",
          background: "red",
        }),
      ]),
    ]
  );

  const style = Err.of(
    noDistinguishingProperties.with(["background", "rgb(100% 0% 0%)"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable(
        [style],
        [addCursor(style)],
        [addOutline(style)]
      ),
    }),
  ]);
});

/******************************************************************
 *
 * Inapplicable tests
 *
 ******************************************************************/
test(`evaluate() is inapplicable to an <a> element with no visible text content`, async (t) => {
  const target = (
    <a href="#">
      <span hidden>Link</span>
    </a>
  );

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      no non-link text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([<p>{target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      no visible non-link text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <p>
      <span hidden>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      whose role has been changed`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <p role="generic">
      <span>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
    no non-link whitespace text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([<p> {target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});
