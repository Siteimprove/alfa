import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R117, { Outcomes } from "../../dist/sia-r117/rule.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

test("evaluate() passes img element with alt attribute that describes the image", async (t) => {
  const altText = "W3C logo";
  const img = <img src="/test-assets/shared/w3c-logo.png" alt={altText} />;

  t.deepEqual(
    await evaluate(
      R117,
      {
        document: h.document([img]),
      },
      oracle({ "is-image-accessible-name-descriptive": true }),
    ),
    [
      passed(
        R117,
        img,
        { 1: Outcomes.ImageAccessibleNameIsDescriptive(altText) },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

// TODO: SVGs fail the isVisible check of the applicability, see https://github.com/Siteimprove/alfa/issues/1844
// test("evaluate() passes svg element with an aria-label attribute that describes the image", async (t) => {
//   const ariaLabel = "HTML 5 logo";
//   const svg = (
//     <svg viewBox="0 0 512 512" aria-label={ariaLabel} role="img">
//       <path d="M108.4 0h23v22.8h21.2V0h23v69h-23V46h-21v23h-23.2M206 23h-20.3V0h63.7v23H229v46h-23M259.5 0h24.1l14.8 24.3L313.2 0h24.1v69h-23V34.8l-16.1 24.8l-16.1-24.8v34.2h-22.6M348.7 0h23v46.2h32.6V69h-55.6" />
//       <path fill="#e44d26" d="M107.6 471l-33-370.4h362.8l-33 370.2L255.7 512" />
//       <path fill="#f16529" d="M256 480.5V131H404.3L376 447" />
//       <path
//         fill="#ebebeb"
//         d="M142 176.3h114v45.4h-64.2l4.2 46.5h60v45.3H154.4M156.4 336.3H202l3.2 36.3 50.8 13.6v47.4l-93.2-26"
//       />
//       <path
//         fill="#fff"
//         d="M369.6 176.3H255.8v45.4h109.6M361.3 268.2H255.8v45.4h56l-5.3 59-50.7 13.6v47.2l93-25.8"
//       />
//     </svg>
//   );
//
//   t.deepEqual(
//     await evaluate(
//       R117,
//       { document: h.document([svg]) },
//       oracle({ "is-image-accessible-name-descriptive": true }),
//     ),
//     [
//       passed(
//         R117,
//         svg,
//         { 1: Outcomes.ImageAccessibleNameIsDescriptive(ariaLabel) },
//         Outcome.Mode.SemiAuto,
//       ),
//     ],
//   );
// });

test("evaluate() passes canvas element with an aria-label attribute that describes the image", async (t) => {
  const ariaLabel = "W3C logo";

  const canvas = (
    <canvas id="logo" width="72" height="48" aria-label="W3C logo"></canvas>
  );

  t.deepEqual(
    await evaluate(
      R117,
      { document: h.document([canvas]) },
      oracle({ "is-image-accessible-name-descriptive": true }),
    ),
    [
      passed(
        R117,
        canvas,
        { 1: Outcomes.ImageAccessibleNameIsDescriptive(ariaLabel) },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() cannot tell if questions are left unanswered", async (t) => {
  const altText = "W3C logo";
  const img = <img src="/test-assets/shared/w3c-logo.png" alt={altText} />;

  t.deepEqual(
    await evaluate(R117, {
      document: h.document([img]),
    }),
    [cantTell(R117, img)],
  );
});

test("evaluate() fails img element with alt attribute that incorrectly describes the image", async (t) => {
  const altText = "ERCIM logo";
  const img = <img src="/test-assets/shared/w3c-logo.png" alt={altText} />;

  t.deepEqual(
    await evaluate(
      R117,
      {
        document: h.document([img]),
      },
      oracle({ "is-image-accessible-name-descriptive": false }),
    ),
    [
      failed(
        R117,
        img,
        { 1: Outcomes.ImageAccessibleNameIsNotDescriptive(altText) },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

// TODO: SVGs fail the isVisible check of the applicability, see https://github.com/Siteimprove/alfa/issues/1844
// test("evaluate() fails svg element with an aria-label attribute that incorrectly describes the image", async (t) => {
//   const ariaLabel = "HTML 5 logo";
//   const svg = (
//     <svg viewBox="0 0 512 512" aria-label={ariaLabel} role="img">
//       <path d="M108.4 0h23v22.8h21.2V0h23v69h-23V46h-21v23h-23.2M206 23h-20.3V0h63.7v23H229v46h-23M259.5 0h24.1l14.8 24.3L313.2 0h24.1v69h-23V34.8l-16.1 24.8l-16.1-24.8v34.2h-22.6M348.7 0h23v46.2h32.6V69h-55.6" />
//       <path fill="#e44d26" d="M107.6 471l-33-370.4h362.8l-33 370.2L255.7 512" />
//       <path fill="#f16529" d="M256 480.5V131H404.3L376 447" />
//       <path
//         fill="#ebebeb"
//         d="M142 176.3h114v45.4h-64.2l4.2 46.5h60v45.3H154.4M156.4 336.3H202l3.2 36.3 50.8 13.6v47.4l-93.2-26"
//       />
//       <path
//         fill="#fff"
//         d="M369.6 176.3H255.8v45.4h109.6M361.3 268.2H255.8v45.4h56l-5.3 59-50.7 13.6v47.2l93-25.8"
//       />
//     </svg>
//   );
//
//   t.deepEqual(
//     await evaluate(
//       R117,
//       { document: h.document([svg]) },
//       oracle({ "is-image-accessible-name-descriptive": false }),
//     ),
//     [
//       failed(
//         R117,
//         svg,
//         { 1: Outcomes.ImageAccessibleNameIsNotDescriptive(ariaLabel) },
//         Outcome.Mode.SemiAuto,
//       ),
//     ],
//   );
// });

test("evaluate() fails canvas element with an aria-label attribute that incorrectly describes the image", async (t) => {
  const ariaLabel = "HTML 5 logo";

  const canvas = (
    <canvas id="logo" width="72" height="48" aria-label={ariaLabel}></canvas>
  );

  t.deepEqual(
    await evaluate(
      R117,
      { document: h.document([canvas]) },
      oracle({ "is-image-accessible-name-descriptive": false }),
    ),
    [
      failed(
        R117,
        canvas,
        { 1: Outcomes.ImageAccessibleNameIsNotDescriptive(ariaLabel) },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() is inapplicable to img element with an empty alt text", async (t) => {
  const document = h.document([
    <img src="/test-assets/shared/pdf-icon.png" alt="" />,
    h.text("PDF document"),
  ]);

  t.deepEqual(await evaluate(R117, { document }), [inapplicable(R117)]);
});

test("evaluate() is inapplicable to img element with an empty accessible name because it has no attributes or content to provide one", async (t) => {
  const document = h.document([
    <p>Happy new year!</p>,
    <img src="/test-assets/shared/fireworks.jpg" role="presentation" />,
  ]);

  t.deepEqual(await evaluate(R117, { document }), [inapplicable(R117)]);
});

test("evaluate() is inapplicable to svg element with an empty accessible name because it has no attributes or content to provide one", async (t) => {
  const document = h.document([
    <p>Happy new year!</p>,
    <svg height="200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,10 40,180 190,60 10,60 160,180" fill="yellow" />
    </svg>,
  ]);

  t.deepEqual(await evaluate(R117, { document }), [inapplicable(R117)]);
});

test("evaluate() is inapplicable to canvas element with an empty accessible name because it has no attributes or content to provide one", async (t) => {
  const document = h.document([
    <p>Happy new year!</p>,
    <canvas id="newyear" width="200" height="200"></canvas>,
  ]);

  t.deepEqual(await evaluate(R117, { document }), [inapplicable(R117)]);
});

test("evaluate() is inapplicable to img element that is not visible", async (t) => {
  const document = h.document([
    <img
      src="/test-assets/shared/w3c-logo.png"
      alt="W3C logo"
      style={{ display: "none" }}
    />,
  ]);

  t.deepEqual(await evaluate(R117, { document }), [inapplicable(R117)]);
});

test("evaluate() is inapplicable to img element that has no accessible name because it is not included in the accessibility tree", async (t) => {
  const document = h.document([
    <img
      aria-hidden="true"
      src="/test-assets/shared/fireworks.jpg"
      alt="fireworks"
    />,
  ]);

  t.deepEqual(await evaluate(R117, { document }), [inapplicable(R117)]);
});
