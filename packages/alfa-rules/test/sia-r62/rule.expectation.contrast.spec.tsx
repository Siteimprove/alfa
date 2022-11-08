import { Percentage, RGB } from "@siteimprove/alfa-css";
import { h } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";
import R62, { Outcomes } from "../../src/sia-r62/rule";
import { evaluate } from "../common/evaluate";
import { failed, passed } from "../common/outcome";
import { Defaults, makePairing } from "./common";

const { noDistinguishingProperties, defaultTextColor, defaultLinkColor } =
  Defaults;

/******************************************************************
 *
 * Contrast as Distinguishing Feature
 *
 ******************************************************************/

// #0000D1 mixed with rgba(255, 255, 255, 0.1)
const offBlue = RGB.of(
  Percentage.of(0.1),
  Percentage.of(0.1),
  Percentage.of(0.837647),
  Percentage.of(1)
);

// #000042 mixed with rgba(255, 255, 255, 0.1)
const offPurple = RGB.of(
  Percentage.of(0.1),
  Percentage.of(0.1),
  Percentage.of(0.3329412),
  Percentage.of(1)
);

// #F9F9F1 mixed with rgba(255, 255, 255, 0.1)
const offWhite = RGB.of(
  Percentage.of(0.9788235),
  Percentage.of(0.9788235),
  Percentage.of(0.9505882),
  Percentage.of(1)
);

test(`evaluate() passes an <a> element that has a difference in contrast of 3:1 as a distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          color: "#949494",
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
    makePairing(
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
    noDistinguishingProperties
      .withPairings(contrastPairings)
      .withDistinguishingProperties(["contrast"])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable([style], [style], [style]),
    }),
  ]);
});

test(`evaluate() passes an <a> element that is distinguishable from the <p> parent element
        as all foregrounds have a contrast of 3:1 in the parent element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          backgroundImage:
            "linear-gradient(to right, red 20%, orange 40%, yellow 100%)",
          color: "rgba(255, 255, 255, .5)",
        }),

        h.rule.style("a, a:hover, a:focus", {
          backgroundImage:
            "linear-gradient(to right, red 20%, orange 40%, yellow 100%)",
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  // red mixed with rgba(255, 255, 255, .5)
  const offRed = RGB.of(
    Percentage.of(1),
    Percentage.of(1),
    Percentage.of(0.5),
    Percentage.of(1)
  );

  // yellow mixed with rgba(255, 255, 255, .5)
  const offYellow = RGB.of(
    Percentage.of(1),
    Percentage.of(0.5),
    Percentage.of(0.5),
    Percentage.of(1)
  );

  // orange mixed with rgba(255, 255, 255, .5)
  const offOrange = RGB.of(
    Percentage.of(1),
    Percentage.of(0.8235294),
    Percentage.of(0.5),
    Percentage.of(1)
  );

  const contrastPairings = [
    makePairing(offRed, defaultLinkColor, 8.89),
    makePairing(offOrange, defaultLinkColor, 6.61),
    makePairing(offYellow, defaultLinkColor, 3.86),
  ];

  const style = Ok.of(
    noDistinguishingProperties
      .withStyle([
        "background",
        "linear-gradient(to right, rgb(100% 0% 0%) 20%, rgb(100% 64.70588000000001% 0%) 40%, rgb(100% 100% 0%) 100%)",
      ])
      .withPairings(contrastPairings)
      .withDistinguishingProperties(["contrast"])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable([style], [style], [style]),
    }),
  ]);
});

test(`evaluate() passes an <a> element that is distinguishable from the <p> parent element
        as some foregrounds have a contrast of 3:1 in the parent element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          backgroundImage:
            "linear-gradient(to right, #F9F9F1 50%, #0000D1 50%)",
          color: "rgba(255, 255, 255, 0.1)",
        }),

        h.rule.style("a, a:hover, a:focus", {
          backgroundImage:
            "linear-gradient(to right, #F9F9F1 50%, #0000D1 50%)",
          textDecoration: "none",
          outline: "none",
          cursor: "auto",
        }),
      ]),
    ]
  );

  const contrastPairings = [
    makePairing(offWhite, defaultLinkColor, 8.93),
    makePairing(offBlue, defaultLinkColor, 1.04),
  ];

  const style = Ok.of(
    noDistinguishingProperties
      .withStyle([
        "background",
        "linear-gradient(to right, rgb(97.64706% 97.64706% 94.5098%) 50%, rgb(0% 0% 81.96078%) 50%)",
      ])
      .withPairings(contrastPairings)
      .withDistinguishingProperties(["contrast"])
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
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
    makePairing(offPurple, defaultLinkColor, 1.7),
    makePairing(offBlue, defaultLinkColor, 1.04),
  ];

  const noStyle = Err.of(
    noDistinguishingProperties
      .withStyle([
        "background",
        "linear-gradient(to right, rgb(0% 0% 81.96078%) 50%, rgb(0% 0% 25.88235%) 50%)",
      ])
      .withPairings(contrastPairings)
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
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

  const contrastPairings = [
    makePairing(defaultTextColor, offBlue, 2.15),
    makePairing(defaultTextColor, offPurple, 1.32),
  ];

  const noStyle = Err.of(
    noDistinguishingProperties
      .withStyle(
        [
          "background",
          "linear-gradient(to right, rgb(0% 0% 81.96078%) 50%, rgb(0% 0% 25.88235%) 50%)",
        ],
        ["color", "rgb(100% 100% 100% / 10%)"]
      )
      .withPairings(contrastPairings)
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
    }),
  ]);
});
