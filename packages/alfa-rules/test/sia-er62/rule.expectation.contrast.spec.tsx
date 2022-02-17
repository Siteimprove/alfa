import { Outcome } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Percentage, RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Record } from "@siteimprove/alfa-record";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";
import { URL } from "@siteimprove/alfa-url";
import { Page } from "@siteimprove/alfa-web";
import { Contrast } from "../../src/common/diagnostic/contrast";
import ER62, { Outcomes } from "../../src/sia-er62/rule";
import { evaluate } from "../common/evaluate";
import { failed, passed } from "../common/outcome";
import {
  Defaults,
  getContainerColor,
  getLinkColor,
  sortContrastPairings,
} from "./common";

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
    Contrast.Pairing.of(
      getContainerColor(
        RGB.of(
          Percentage.of(0.5803922),
          Percentage.of(0.5803922),
          Percentage.of(0.5803922),
          Percentage.of(1)
        )
      ),
      getLinkColor(defaultLinkColor),
      3.1
    ),
  ];

  const style = Ok.of(
    noDistinguishingProperties
      .withPairings(contrastPairings)
      .withDistinguishingProperties(["contrast"])
  );

  t.deepEqual(await evaluate(ER62, { document }), [
    passed(ER62, target, {
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
    Contrast.Pairing.of(
      getContainerColor(offYellow),
      getLinkColor(defaultLinkColor),
      3.86
    ),
    Contrast.Pairing.of(
      getContainerColor(offOrange),
      getLinkColor(defaultLinkColor),
      6.61
    ),
    Contrast.Pairing.of(
      getContainerColor(offRed),
      getLinkColor(defaultLinkColor),
      8.89
    ),
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

  const page = Page.of(
    Request.of("GET", URL.example()),
    Response.of(URL.example(), 200),
    document,
    Device.standard()
  );

  t.deepEqual(sortContrastPairings(await ER62.evaluate(page), target), [
    passed(ER62, target, {
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
    Contrast.Pairing.of(
      getContainerColor(offBlue),
      getLinkColor(defaultLinkColor),
      1.04
    ),
    Contrast.Pairing.of(
      getContainerColor(offWhite),
      getLinkColor(defaultLinkColor),
      8.93
    ),
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

  const page = Page.of(
    Request.of("GET", URL.example()),
    Response.of(URL.example(), 200),
    document,
    Device.standard()
  );

  t.deepEqual(sortContrastPairings(await ER62.evaluate(page), target), [
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
      getContainerColor(offBlue),
      getLinkColor(defaultLinkColor),
      1.04
    ),
    Contrast.Pairing.of(
      getContainerColor(offPurple),
      getLinkColor(defaultLinkColor),
      1.7
    ),
  ];

  const noStyle = Err.of(
    noDistinguishingProperties
      .withStyle([
        "background",
        "linear-gradient(to right, rgb(0% 0% 81.96078%) 50%, rgb(0% 0% 25.88235%) 50%) 0% 0%",
      ])
      .withPairings(contrastPairings)
  );

  const page = Page.of(
    Request.of("GET", URL.example()),
    Response.of(URL.example(), 200),
    document,
    Device.standard()
  );

  // const expectation = sortContrastPairings(
  //   Iterable.from([
  //     Outcome.Failed.of(
  //       ER62,
  //       target,
  //       Record.from(
  //         Object.entries({
  //           1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
  //         })
  //       )
  //     ),
  //   ]),
  //   target
  // );

  t.deepEqual(sortContrastPairings(await ER62.evaluate(page), target), [
    failed(ER62, target, {
      1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
    }),
  ]);
});

// test(`evaluate() fails an <a> element that is not distinguishable from the <p> parent element as none of the foregrounds have a contrast of 3:1 in the child element`, async (t) => {
//   const target = <a href="#">Link</a>;

//   const document = h.document(
//     [<p>Hello {target}</p>],
//     [
//       h.sheet([
//         h.rule.style("p", {
//           background: "linear-gradient(to right, #0000D1 50%, #000042 50%)",
//         }),

//         h.rule.style("a, a:hover, a:focus", {
//           background: "linear-gradient(to right, #0000D1 50%, #000042 50%)",
//           color: "rgba(255, 255, 255, 0.1)",
//           textDecoration: "none",
//           outline: "none",
//           cursor: "auto",
//         }),
//       ]),
//     ]
//   );

//   const contrastPairings = [
//     Contrast.Pairing.of(
//       getContainerColor(defaultTextColor),
//       getLinkColor(offPurple),
//       1.32
//     ),
//     Contrast.Pairing.of(
//       getContainerColor(defaultTextColor),
//       getLinkColor(offBlue),
//       2.15
//     ),
//   ];

//   const noStyle = Err.of(
//     noDistinguishingProperties
//       .withStyle(
//         [
//           "background",
//           "linear-gradient(to right, rgb(0% 0% 81.96078%) 50%, rgb(0% 0% 25.88235%) 50%) 0% 0%",
//         ],
//         ["color", "rgb(100% 100% 100% / 10%)"]
//       )
//       .withPairings(contrastPairings)
//   );

//   const page = Page.of(
//     Request.of("GET", URL.example()),
//     Response.of(URL.example(), 200),
//     document,
//     Device.standard()
//   );

//   t.deepEqual(sortContrastPairings(await ER62.evaluate(page), target), [
//     failed(ER62, target, {
//       1: Outcomes.IsNotDistinguishable([noStyle], [noStyle], [noStyle]),
//     }),
//   ]);
// });
