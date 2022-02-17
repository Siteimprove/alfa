import { h } from "@siteimprove/alfa-dom";
import { Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";
import { Contrast } from "../../src/common/diagnostic/contrast";
import { ElementDistinguishable } from "../../src/sia-er62/diagnostics";
import ER62, { Outcomes } from "../../src/sia-er62/rule";
import { evaluate } from "../common/evaluate";
import { failed, passed } from "../common/outcome";
import { Defaults, addCursor, getContainerColor, getLinkColor } from "./common";

const {
  defaultStyle,
  hoverStyle,
  focusStyle,
  noStyle,
  noDistinguishingProperties,
  defaultTextColor,
} = Defaults;

/******************************************************************
 *
 * Text Decoration as Distinguishing Feature
 *
 ******************************************************************/

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
    noDistinguishingProperties
      .withStyle(["font", "700 16px serif"])
      .withDistinguishingProperties(["font"])
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

// test(`evaluates() doesn't break when link text is nested`, async (t) => {
//   // Since text-decoration and focus outline is not inherited, the <span> has
//   // effectively no style other than color.
//   const target = (
//     <a href="#">
//       <span>Link</span>
//     </a>
//   );

//   const document = h.document([<p>Hello {target}</p>]);

//   t.deepEqual(await evaluate(ER62, { document }), [
//     passed(ER62, target, {
//       1: Outcomes.IsDistinguishable(
//         [defaultStyle, noStyle],
//         [hoverStyle, addCursor(noStyle)],
//         [focusStyle, noStyle]
//       ),
//     }),
//   ]);
// });

// test(`evaluates() accepts decoration on parents of links`, async (t) => {
//   const target = <a href="#">Link</a>;

//   const document = h.document(
//     [
//       <p>
//         Hello <span>{target}</span>
//       </p>,
//     ],
//     [
//       h.sheet([
//         h.rule.style("a", {
//           textDecoration: "none",
//           cursor: "auto",
//         }),
//         h.rule.style("a:focus", {
//           outline: "none",
//         }),
//         h.rule.style("span", { fontWeight: "bold" }),
//       ]),
//     ]
//   );

//   const linkStyle = Ok.of(
//     noDistinguishingProperties
//       .withStyle(["font", "700 16px serif"])
//       .withDistinguishingProperties(["font"])
//   );

//   const spanStyle = Ok.of(
//     ElementDistinguishable.of(
//       ["font"],
//       [
//         ["border-width", "0px"],
//         ["font", "700 16px serif"],
//         ["outline", "0px"],
//       ],
//       [
//         Contrast.Pairing.of(
//           getContainerColor(defaultTextColor),
//           getLinkColor(defaultTextColor),
//           1
//         ),
//       ]
//     )
//   );

//   t.deepEqual(await evaluate(ER62, { document }), [
//     passed(ER62, target, {
//       1: Outcomes.IsDistinguishable(
//         [spanStyle, linkStyle],
//         [spanStyle, linkStyle],
//         [spanStyle, linkStyle]
//       ),
//     }),
//   ]);
// });

// test(`evaluates() deduplicate styles in diagnostic`, async (t) => {
//   const target = (
//     <a href="#">
//       <span>click</span> <span>here</span>
//     </a>
//   );

//   const document = h.document([<p>Hello {target}</p>]);

//   t.deepEqual(await evaluate(ER62, { document }), [
//     passed(ER62, target, {
//       1: Outcomes.IsDistinguishable(
//         [defaultStyle, noStyle],
//         [hoverStyle, addCursor(noStyle)],
//         [focusStyle, noStyle]
//       ),
//     }),
//   ]);
// });

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
