import { Percentage, RGB } from "@siteimprove/alfa-css";
import { h } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";
import ER62, { Outcomes } from "../../src/sia-er62/rule";
import { evaluate } from "../common/evaluate";
import { inapplicable, passed } from "../common/outcome";
import { Defaults, addCursor, addOutline, makePairing } from "./common";

const {
  defaultStyle,
  hoverStyle,
  focusStyle,
  noDistinguishingProperties,
  linkProperties,
  defaultTextColor,
  defaultLinkColor,
  defaultContrastPairings,
} = Defaults;

test(`evaluate() is applicable to an <a> element with a <p> parent element with non-link
      text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() is applicable to an <a> element with a <p> parent element with non-link
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

test(`evaluate() is applicable to an <a> element with a <div role="paragraph"> parent element
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

test(`evaluate() is applicable to an <a> element with a <p> parent element
    when at least one child textnode of the <p> element has a different foreground color from the <a> element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span>
          Hello
          <span>World</span>
        </span>
        {target}
        <strong>Differently colored text</strong>
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("span", {
          color: "#0000EE",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    linkProperties.withPairings([
      ...defaultContrastPairings,
      makePairing(defaultLinkColor, defaultLinkColor, 1),
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

test(`evaluate() is applicable to an <a> element with a <p> parent element
    when the textnode of the <p> element is deeply nested in spans and has a different foreground color from the <a> element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span class="span-blue">
          <span class="span-blue">
            <span class="span-blue">
              <span class="span-black">World</span>
            </span>
          </span>
        </span>
        {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("span-blue", {
          color: "#0000EE",
        }),
        h.rule.style("span-black", {
          color: "black",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() is applicable to an <a> element with a <p> parent element
    when the textnode of the <a> element is deeply nested in spans
    and has a different foreground color from the <p> element's textnode`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span>Hello</span>
        <span>
          <span>
            <span>{target}</span>
          </span>
        </span>
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("span", {
          color: "black",
        }),
      ]),
    ]
  );

  const spanStyle = Err.of(
    noDistinguishingProperties
      .withPairings([makePairing(defaultTextColor, defaultTextColor, 1)])
      .withStyle(["color", "rgb(0% 0% 0%)"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [defaultStyle, spanStyle],
        [hoverStyle, spanStyle],
        [focusStyle, spanStyle]
      ),
    }),
  ]);
});

test(`evaluate() is applicable to an <a> element with a <p> parent element
    when the foreground color of the <p> and <a> are the same
    but the foreground color of the nested <span> in the <a> is different`, async (t) => {
  const target = (
    <a href="#">
      Link <span>world</span>
    </a>
  );

  const document = h.document(
    [
      <p>
        Hello
        {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("span", {
          color: "black",
        }),

        h.rule.style("p", {
          color: "#0000EE",
        }),
      ]),
    ]
  );

  const style = Ok.of(
    linkProperties.withPairings([
      makePairing(defaultLinkColor, defaultLinkColor, 1),
    ])
  );

  const spanStyle = noDistinguishingProperties
    .withPairings([makePairing(defaultLinkColor, defaultTextColor, 2.23)])
    .withStyle(["color", "rgb(0% 0% 0%)"]);

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
      1: Outcomes.IsDistinguishable(
        [style, Err.of(spanStyle)],
        [addCursor(Ok.of(spanStyle)), addCursor(style)],
        [addOutline(style), Err.of(spanStyle)]
      ),
    }),
  ]);
});

test(`evaluate() is applicable to an <a> element when there is a <p> parent element
    with different foreground color`, async (t) => {
  const target1 = <a href="#">Link</a>;
  const target2 = <a href="#">Link</a>;

  const document = h.document(
    [
      <div>
        <p class="p-one">
          Hello
          {target1}
        </p>
        <p class="p-two">
          Hello
          {target2}
        </p>
      </div>,
    ],
    [
      h.sheet([
        h.rule.style(".p-one", {
          color: "#0000EE",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target2, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

test(`evaluate() is applicable to several <a> elements when there is a <p> parent element
    with different foreground color`, async (t) => {
  const target1 = <a href="#">Link</a>;
  const target2 = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        Hello
        {target1}
        {target2}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("p-one", {
          color: "#0000EE",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target1, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
    passed(ER62, target2, {
      1: Outcomes.IsDistinguishable([defaultStyle], [hoverStyle], [focusStyle]),
    }),
  ]);
});

// If the link and the container have a foreground with the alpha channel less than 1 and the background is gradient
// then the rule is applicable as we can't tell for sure if they truly have the same foreground color
// because of the different gradient types and spreads

test(`evaluate() is applicable to an <a> element with a <p> parent element that has the text content wrapped in a span
    when both have the same linear gradient foreground color`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span>Hello</span>
        {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("span", {
          background: "linear-gradient(to right, #000000 50%, #0000EE 50%)",
          color: "rgba(255, 255, 255, 0.1)",
        }),

        h.rule.style("a", {
          background: "linear-gradient(to right, #000000 50%, #0000EE 50%)",
          color: "rgba(255, 255, 255, 0.1)",
        }),
      ]),
    ]
  );

  // #000000 mixed with rgba(255, 255, 255, 0.1)
  const offBlack = RGB.of(
    Percentage.of(0.1),
    Percentage.of(0.1),
    Percentage.of(0.1),
    Percentage.of(1)
  );

  // #0000EE mixed with rgba(255, 255, 255, 0.1)
  const offBlue = RGB.of(
    Percentage.of(0.1),
    Percentage.of(0.1),
    Percentage.of(0.94),
    Percentage.of(1)
  );

  const style = Ok.of(
    noDistinguishingProperties
      .withStyle(
        [
          "background",
          "linear-gradient(to right, rgb(0% 0% 0%) 50%, rgb(0% 0% 93.33333%) 50%) 0% 0%",
        ],
        ["color", "rgb(100% 100% 100% / 10%)"],
        ["text-decoration", "underline"]
      )
      .withPairings([
        makePairing(defaultTextColor, offBlue, 2.44),
        makePairing(offBlack, offBlue, 2.03),
        makePairing(offBlue, offBlack, 2.03),
        makePairing(defaultTextColor, offBlack, 1.2),
        makePairing(offBlue, offBlue, 1),
        makePairing(offBlack, offBlack, 1),
      ])
      .withDistinguishingProperties(["background", "text-decoration"])
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

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
    when both have the same foreground color`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          color: "#0000EE",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
    when the parent element has the text content wrapped in a <span> element and it has the same foreground color as the <a> element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [
      <p>
        <span>Hello</span>
        {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("span", {
          color: "#0000EE",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluates() is inapplicable when the only non-link text is in a nested paragraph`, async (t) => {
  // While nested <p> are not allowed in HTML, they do appear on some live sites.
  // In a case like that, the link should not be applicable because the non-link
  // text is in another paragraph
  const document = h.document([
    <p>
      <a href="#">World</a>
      <p>Hello</p>
    </p>,
  ]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});

test(`evaluates() is inapplicable when there is no non-link text in a nested paragraph`, async (t) => {
  // While nested <p> are not allowed in HTML, they do appear on some live sites.
  // In a case like that, the link should not be applicable because its closest
  // <p> ancestor has no non-link text to compare to.
  const document = h.document([
    <p>
      Lorem ipsum
      <p>Hello</p>
      <p>
        <a href="#">World</a>
      </p>
    </p>,
  ]);

  t.deepEqual(await evaluate(ER62, { document }), [inapplicable(ER62)]);
});
