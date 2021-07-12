import { h } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Property } from "@siteimprove/alfa-style";
import { test } from "@siteimprove/alfa-test";

import R62, { ComputedStyles, Outcomes } from "../../src/sia-r62/rule";

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
const defaultProperties: Array<
  [Property.Name | Property.Shorthand.Name, string]
> = [
  ["border-width", "0px"],
  ["color", "rgb(0% 0% 93.33333%)"],
  ["text-decoration", "underline"],
  ["outline", "0px"],
];
const focusProperties: Array<
  [Property.Name | Property.Shorthand.Name, string]
> = [
  ["border-width", "0px"],
  ["color", "rgb(0% 0% 93.33333%)"],
  ["outline", "auto"],
  ["text-decoration", "underline"],
];
const noDistinguishingProperties: Array<
  [Property.Name | Property.Shorthand.Name, string]
> = [
  ["border-width", "0px"],
  ["color", "rgb(0% 0% 93.33333%)"],
  ["outline", "0px"],
];

const defaultStyle = Ok.of(ComputedStyles.of(defaultProperties));
const focusStyle = Ok.of(ComputedStyles.of(focusProperties));
const noStyle = Err.of(ComputedStyles.of(noDistinguishingProperties));

test(`evaluate() passes an <a> element with a <p> parent element with non-link
      text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle],
        [defaultStyle],
        [focusStyle]
      ),
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

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle],
        [defaultStyle],
        [focusStyle]
      ),
    }),
  ]);
});

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
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
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
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
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

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable(
        [defaultStyle],
        [defaultStyle],
        [noStyle]
      ),
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
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
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
        }),

        h.rule.style("a:hover", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
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
        }),

        h.rule.style("a:focus", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
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
        }),

        h.rule.style("a:hover, a:focus", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable(
        [noStyle],
        [defaultStyle],
        [defaultStyle]
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
      ["color", "rgb(0% 0% 93.33333%)"],
      ["outline", "auto"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable([style], [style], [style]),
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
    ComputedStyles.of([
      ["border-width", "0px 0px 1px"],
      ["border-style", "none none solid"],
      ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [style],
        [
          Ok.of(
            ComputedStyles.of([
              ["color", "rgb(0% 0% 93.33333%)"],
              ["outline", "auto"],
              ["border-width", "0px 0px 1px"],
              ["border-style", "none none solid"],
              ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"],
            ])
          ),
        ]
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
    ComputedStyles.of([
      ["color", "rgb(0% 0% 93.33333%)"],
      ["border-width", "0px 0px 1px"],
      ["border-style", "none none solid"],
      ["border-color", "currentcolor currentcolor rgb(0% 0% 0% / 0%)"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable(
        [style],
        [style],
        [
          Ok.of(
            ComputedStyles.of([
              ["color", "rgb(0% 0% 93.33333%)"],
              ["border-width", "0px 0px 1px"],
              ["border-style", "none none solid"],
              ["border-color", "currentcolor currentcolor rgb(0% 0% 0% / 0%)"],
              ["outline", "auto"],
            ])
          ),
        ]
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
    ComputedStyles.of([
      ["color", "rgb(0% 0% 93.33333%)"],
      ["border-width", "0px"],
      ["border-style", "none none solid"],
      ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable(
        [style],
        [style],
        [
          Ok.of(
            ComputedStyles.of([
              ["color", "rgb(0% 0% 93.33333%)"],
              ["outline", "auto"],
              ["border-width", "0px"],
              ["border-style", "none none solid"],
              ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"],
            ])
          ),
        ]
      ),
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
    ComputedStyles.of([
      ["border-width", "0px"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["background-color", "rgb(100% 0% 0%)"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [style],
        [
          Ok.of(
            ComputedStyles.of([
              ["border-width", "0px"],
              ["color", "rgb(0% 0% 93.33333%)"],
              ["background-color", "rgb(100% 0% 0%)"],
              ["outline", "auto"],
            ])
          ),
        ]
      ),
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features but is
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

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable(
        [noStyle],
        [noStyle],
        [
          Ok.of(
            ComputedStyles.of([
              ["border-width", "0px"],
              ["color", "rgb(0% 0% 93.33333%)"],
              ["outline", "auto"],
            ])
          ),
        ]
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
    ComputedStyles.of([
      ["border-width", "0px"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["background-color", "rgb(100% 0% 0%)"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable(
        [style],
        [style],
        [
          Ok.of(
            ComputedStyles.of([
              ["border-width", "0px"],
              ["color", "rgb(0% 0% 93.33333%)"],
              ["background-color", "rgb(100% 0% 0%)"],
              ["outline", "auto"],
            ])
          ),
        ]
      ),
    }),
  ]);
});

test(`evaluate() is inapplicable to an <a> element with no visible text content`, async (t) => {
  const target = (
    <a href="#">
      <span hidden>Link</span>
    </a>
  );

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      no non-link text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([<p>{target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      no visible non-link text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <p>
      <span hidden>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});

test(`evaluate() passes an <a> element with a <div role="paragraph"> parent element
      with non-link text content in a <span> child element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <div role="paragraph">
      <span>Hello</span> {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle],
        [defaultStyle],
        [focusStyle]
      ),
    }),
  ]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      whose role has been changed`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([
    <p role="generic">
      <span>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
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
    ComputedStyles.of([
      ["border-width", "0px"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["font-weight", "700"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [style],
        [style],
        [
          Ok.of(
            ComputedStyles.of([
              ["border-width", "0px"],
              ["color", "rgb(0% 0% 93.33333%)"],
              ["font-weight", "700"],
              ["outline", "auto"],
            ])
          ),
        ]
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

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle, noStyle],
        [defaultStyle, noStyle],
        [focusStyle, noStyle]
      ),
    }),
  ]);
});

test(`evaluates() accepts decoration on children of links`, async (t) => {
  // Since text-decoration and focus outline is not inherited, the <span> has
  // effectively no style other than color.
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
        }),
        h.rule.style("a:focus", {
          textDecoration: "none",
          outline: "none",
        }),
        h.rule.style("span", { fontWeight: "bold" }),
      ]),
    ]
  );

  const style = Ok.of(
    ComputedStyles.of([
      ["border-width", "0px"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["font-weight", "700"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [style, noStyle],
        [style, noStyle],
        [style, noStyle]
      ),
    }),
  ]);
});

test(`evaluates() accepts decoration on parents of links`, async (t) => {
  // Since text-decoration and focus outline is not inherited, the <span> has
  // effectively no style other than color.
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
        }),
        h.rule.style("a:focus", {
          textDecoration: "none",
          outline: "none",
        }),
        h.rule.style("span", { fontWeight: "bold" }),
      ]),
    ]
  );

  const linkStyle = Ok.of(
    ComputedStyles.of([
      ["border-width", "0px"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["font-weight", "700"],
      ["outline", "0px"],
    ])
  );
  const spanStyle = Ok.of(
    ComputedStyles.of([
      ["border-width", "0px"],
      ["font-weight", "700"],
      ["outline", "0px"],
    ])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [linkStyle, spanStyle],
        [linkStyle, spanStyle],
        [linkStyle, spanStyle]
      ),
    }),
  ]);
});

test(`evaluates() deduplicate styles in diagnostic`, async (t) => {
  // Since text-decoration and focus outline is not inherited, the <span> has
  // effectively no style other than color.
  const target = (
    <a href="#">
      <span>click</span> <span>here</span>
    </a>
  );

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle, noStyle],
        [defaultStyle, noStyle],
        [focusStyle, noStyle]
      ),
    }),
  ]);
});
