import { h } from "@siteimprove/alfa-dom";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import ER62, { Outcomes } from "../../src/sia-er62/rule";

import { ElementDistinguishable } from "../../src/sia-er62/diagnostics";
import { Contrast } from "../../src/common/diagnostic/contrast";
import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";
import { Percentage, RGB } from "@siteimprove/alfa-css";
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

const defaultLinkColor = RGB.of(
  Percentage.of(0),
  Percentage.of(0),
  Percentage.of(0.9333333),
  Percentage.of(1)
);

const defaultTextColor = RGB.of(
  Percentage.of(0),
  Percentage.of(0),
  Percentage.of(0),
  Percentage.of(1)
);

const defaultContrastPairings = [
  Contrast.Pairing.of(defaultTextColor, defaultLinkColor, 2.23),
];

const noDistinguishingProperties = ElementDistinguishable.of(
  [
    ["border-width", "0px"],
    ["font", "16px serif"],
    ["color", "rgb(0% 0% 93.33333%)"],
    ["outline", "0px"],
  ],
  defaultContrastPairings
);

const linkProperties = noDistinguishingProperties.withStyle([
  "text-decoration",
  "underline",
]);

function addCursor(
  style: Result<ElementDistinguishable>
): Result<ElementDistinguishable> {
  return (style.isOk() ? style : Ok.of(style.getErr())).map((props) =>
    props.withStyle(["cursor", "pointer"])
  );
}
function addOutline(
  style: Result<ElementDistinguishable>
): Result<ElementDistinguishable> {
  return (style.isOk() ? style : Ok.of(style.getErr())).map((props) =>
    props.withStyle(["outline", "auto"])
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
    noDistinguishingProperties.withStyle(
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
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "16px serif"],
        ["color", "rgb(0% 0% 93.33333%)"],
        ["outline", "auto"],
      ],
      defaultContrastPairings
    )
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
    noDistinguishingProperties.withStyle(["background", "rgb(100% 0% 0%)"])
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
    noDistinguishingProperties.withStyle(["font", "700 16px serif"])
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
    noDistinguishingProperties.withStyle([
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
    noDistinguishingProperties.withStyle(["vertical-align", "super"])
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
    noDistinguishingProperties.withStyle(["font", '16px "some-font", serif'])
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
    noDistinguishingProperties.withStyle(["font", "700 16px serif"])
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
    noDistinguishingProperties.withStyle(["font", "700 16px serif"])
  );

  const spanStyle = Ok.of(
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "700 16px serif"],
        ["outline", "0px"],
      ],
      [Contrast.Pairing.of(defaultTextColor, defaultTextColor, 1)]
    )
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
    noDistinguishingProperties.withStyle([
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
    noDistinguishingProperties.withStyle(["vertical-align", "super"])
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
    noDistinguishingProperties.withStyle(
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
    noDistinguishingProperties.withStyle(
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
    noDistinguishingProperties.withStyle(["background", "rgb(100% 0% 0%)"])
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

test(`evaluate() passes an <a> element that has a difference in contrast of 3:1 as a distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          color: "rgb(148, 148, 148)",
        }),

        h.rule.style("a", {
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  const contrastPairings = [
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(0.5803922),
        Percentage.of(0.5803922),
        Percentage.of(0.5803922),
        Percentage.of(1)
      ),
      defaultLinkColor,
      3.1
    ),
  ];

  const style = Ok.of(
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "16px serif"],
        ["color", "rgb(0% 0% 93.33333%)"],
        ["outline", "0px"],
      ],
      contrastPairings
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([style], [style], [style]),
    }),
  ]);
});

test(`evaluate() passes an <a> element that is distinguishable from the <p> parent element as all foregrounds have a contrast of 3:1 in the parent element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          backgroundImage:
            "linear-gradient(to right, red 20%, orange 40%, yellow 60%, green 100%)",
          color: "rgba(255, 255, 255, .5)",
        }),

        h.rule.style("a, a:hover, a:focus", {
          backgroundImage:
            "linear-gradient(to right, red 20%, orange 40%, yellow 60%, green 100%)",
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  const contrastPairings = [
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(1),
        Percentage.of(1),
        Percentage.of(0.5),
        Percentage.of(1)
      ),
      defaultLinkColor,
      8.89
    ),
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(1),
        Percentage.of(0.8235294),
        Percentage.of(0.5),
        Percentage.of(1)
      ),
      defaultLinkColor,
      6.61
    ),
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(1),
        Percentage.of(0.5),
        Percentage.of(0.5),
        Percentage.of(1)
      ),
      defaultLinkColor,
      3.86
    ),
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(0.5),
        Percentage.of(0.7509804),
        Percentage.of(0.5),
        Percentage.of(1)
      ),
      defaultLinkColor,
      4.35
    ),
  ];

  const style = Ok.of(
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "16px serif"],
        ["color", "rgb(0% 0% 93.33333%)"],
        ["outline", "0px"],
        [
          "background",
          "linear-gradient(to right, rgb(100% 0% 0%) 20%, rgb(100% 64.70588000000001% 0%) 40%, rgb(100% 100% 0%) 60%, rgb(0% 50.196079999999995% 0%) 100%)",
        ],
      ],
      contrastPairings
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([style], [style], [style]),
    }),
  ]);
});

test(`evaluate() passes an <a> element that is distinguishable from the <p> parent element as some foregrounds have a contrast of 3:1 in the parent element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          backgroundImage: "linear-gradient(to right, #F9F9F1 50%, blue 50%)",
          color: "rgba(255, 255, 255, 0.1)",
        }),

        h.rule.style("a, a:hover, a:focus", {
          backgroundImage: "linear-gradient(to right, #F9F9F1 50%, blue 50%)",
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  const contrastPairings = [
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(0.1),
        Percentage.of(0.1),
        Percentage.of(1),
        Percentage.of(1)
      ),
      defaultLinkColor,
      1.18
    ),
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(0.9788235),
        Percentage.of(0.9788235),
        Percentage.of(0.9505882),
        Percentage.of(1)
      ),
      defaultLinkColor,
      8.93
    ),
  ];

  const style = Ok.of(
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "16px serif"],
        ["color", "rgb(0% 0% 93.33333%)"],
        ["outline", "0px"],
        [
          "background",
          "linear-gradient(to right, rgb(97.64706% 97.64706% 94.5098%) 50%, rgb(0% 0% 100%) 50%)",
        ],
      ],
      contrastPairings
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([style], [style], [style]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that is not distinguishable from the <p> parent element as none of the foregrounds have a contrast of 3:1 in the parent element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          background: "linear-gradient(to right, #0000D1 50%, #000042 50%)",
          color: "rgba(255, 255, 255, 0.1)",
        }),

        h.rule.style("a, a:hover, a:focus", {
          background: "linear-gradient(to right, #0000D1 50%, #000042 50%)",
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  const contrastPairings = [
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(0.1),
        Percentage.of(0.1),
        Percentage.of(0.837647),
        Percentage.of(1)
      ),
      defaultLinkColor,
      1.04
    ),
    Contrast.Pairing.of(
      RGB.of(
        Percentage.of(0.1),
        Percentage.of(0.1),
        Percentage.of(0.3329412),
        Percentage.of(1)
      ),
      defaultLinkColor,
      1.7
    ),
  ];

  const noStyle = Err.of(
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "16px serif"],
        ["color", "rgb(0% 0% 93.33333%)"],
        ["outline", "0px"],
        [
          "background",
          "linear-gradient(to right, rgb(0% 0% 81.96078%) 50%, rgb(0% 0% 25.88235%) 50%) 0% 0%",
        ],
      ],
      contrastPairings
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
    }),
  ]);
});

test(`evaluate() fails an <a> element that is not distinguishable from the <p> parent element as none of the foregrounds have a contrast of 3:1 in the child element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          background: "linear-gradient(to right, #0000D1 50%, #000042 50%)",
          color: "blue",
        }),

        h.rule.style("a, a:hover, a:focus", {
          background: "linear-gradient(to right, #0000D1 50%, #000042 50%)",
          color: "rgba(255, 255, 255, 0.1)",
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  const pColor = RGB.of(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(1),
    Percentage.of(1)
  );

  const contrastPairings = [
    Contrast.Pairing.of(
      pColor,
      RGB.of(
        Percentage.of(0.1),
        Percentage.of(0.1),
        Percentage.of(0.837647),
        Percentage.of(1)
      ),
      1.14
    ),
    Contrast.Pairing.of(
      pColor,
      RGB.of(
        Percentage.of(0.1),
        Percentage.of(0.1),
        Percentage.of(0.3329412),
        Percentage.of(1)
      ),
      1.86
    ),
  ];

  const noStyle = Err.of(
    ElementDistinguishable.of(
      [
        ["border-width", "0px"],
        ["font", "16px serif"],
        ["color", "rgb(0% 0% 93.33333%)"],
        ["outline", "0px"],
        [
          "background",
          "linear-gradient(to right, rgb(0% 0% 81.96078%) 50%, rgb(0% 0% 25.88235%) 50%) 0% 0%",
        ],
        ["color", "rgb(100% 100% 100% / 10%)"]
      ],
      contrastPairings
    )
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
    }),
  ]);
});
