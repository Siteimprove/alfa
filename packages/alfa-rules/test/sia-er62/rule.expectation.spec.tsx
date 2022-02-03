import { h } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";
import { ElementDistinguishable } from "../../src/sia-er62/diagnostics";
import ER62, { Outcomes } from "../../src/sia-er62/rule";
import { evaluate } from "../common/evaluate";
import { failed, passed } from "../common/outcome";
import { Defaults, addCursor, addOutline } from "./common";

const {
  defaultStyle,
  hoverStyle,
  noStyle,
  noDistinguishingProperties,
  defaultContrastPairings,
} = Defaults;

/******************************************************************
 *
 * Background as Distinguishing Feature
 *
 ******************************************************************/
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
    noDistinguishingProperties
      .withStyle([
        "background",
        "linear-gradient(to right, rgb(1.56863% 41.96078% 60%) 50%, rgb(0% 0% 0% / 0%) 50%)",
      ])
      .withDistinguishingProperties(["background"])
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
    noDistinguishingProperties
      .withStyle(["background", "rgb(100% 0% 0%)"])
      .withDistinguishingProperties(["background"])
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

// /******************************************************************
//  *
//  * Box-shadow as Distinguishing Feature
//  *
//  ******************************************************************/

test(`evaluate() passes an applicable <a> element that removes the default text
 decoration and instead applies a box shadow`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          outline: "none",
          "box-shadow": "10px 5px 5px red",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties
      .withStyle(["box-shadow", "10px 5px 5px rgb(100% 0% 0%)"])
      .withDistinguishingProperties(["box-shadow"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([style], [addCursor(style)], [style]),
    }),
  ]);
});

test(`evaluate() fails an applicable <a> element that removes the default text
      decoration and applies a box shadow with initial value`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          outline: "none",
          "box-shadow": "initial",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable(
        [noStyle],
        [addCursor(noStyle)],
        [noStyle]
      ),
    }),
  ]);
});

// /******************************************************************
//  *
//  * Border as Distinguishing Feature
//  *
//  ******************************************************************/

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
    noDistinguishingProperties
      .withStyle(
        ["border-width", "0px 0px 1px"],
        ["border-style", "none none solid"],
        ["border-color", "currentcolor currentcolor rgb(0% 0% 0%)"],
        ["outline", "0px"]
      )
      .withDistinguishingProperties(["border"])
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

// /******************************************************************
//  *
//  * Font as Distinguishing Feature
//  *
//  ******************************************************************/
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
    noDistinguishingProperties
      .withStyle(["font", "700 16px serif"])
      .withDistinguishingProperties(["font"])
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
    noDistinguishingProperties
      .withStyle(["font", '16px "some-font", serif'])
      .withDistinguishingProperties(["font"])
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

// /******************************************************************
//  *
//  * Outline as Distinguishing Feature
//  *
//  ******************************************************************/
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
      ["outline"],
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

/******************************************************************
 *
 * Vertical Align as Distinguishing Feature
 *
 ******************************************************************/

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
    noDistinguishingProperties
      .withStyle(["vertical-align", "super"])
      .withDistinguishingProperties(["vertical-align"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style, noStyle],
        [addCursor(noStyle), addCursor(style)],
        [addOutline(noStyle), style]
      ),
    }),
  ]);
});

/******************************************************************
 *
 * Multiple Distinguishing Features
 *
 ******************************************************************/

test(`evaluate() passes an <a> element with a <p> parent element when 
      background, box-shadow and text-decoration are distinguishing features`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          background: "black",
          "box-shadow": "10px 5px 5px red",
          fontWeight: "bold",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    noDistinguishingProperties
      .withStyle(["background", "rgb(0% 0% 0%)"])
      .withStyle(["box-shadow", "10px 5px 5px rgb(100% 0% 0%)"])
      .withStyle(["font", "700 16px serif"])
      .withStyle(["text-decoration", "underline"])
      .withDistinguishingProperties([
        "background",
        "box-shadow",
        "font",
        "text-decoration",
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
