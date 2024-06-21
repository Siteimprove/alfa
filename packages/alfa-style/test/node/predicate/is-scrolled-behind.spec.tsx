import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { isScrolledBehind } from "../../../src/node/predicate/is-scrolled-behind";

const overflowKeywords = [
  "visible",
  "hidden",
  "clip",
  "scroll",
  "auto",
] as const;

function expectation(
  testCase: "right" | "below" | "inside",
  overflowX: (typeof overflowKeywords)[number],
  overflowY: (typeof overflowKeywords)[number],
) {
  switch (testCase) {
    case "right":
      return !(
        overflowX === "visible" &&
        (overflowY === "visible" || overflowY === "clip")
      );
    case "below":
      return !(
        overflowY === "visible" &&
        (overflowX === "visible" || overflowX === "clip")
      );
    case "inside":
      return false;
  }
}

// testCase: right
for (const overflowX of overflowKeywords) {
  for (const overflowY of overflowKeywords) {
    const exp = expectation("right", overflowX, overflowY);

    test(`isScrolledBehind() is ${exp} for element positioned to the right of container
          with overflow: ${overflowX} ${overflowY}`, (t) => {
      const device = Device.standard();
      const button = (
        <button box={{ device, x: 114, y: 9, width: 50, height: 20 }}>
          foo
        </button>
      );
      const div = (
        <div box={{ device, x: 8, y: 8, width: 102, height: 102 }}>
          {button}
        </div>
      );

      h.document(
        [div],
        [
          h.sheet([
            h.rule.style("div", {
              overflow: `${overflowX} ${overflowY}`,
              width: "100px",
              height: "100px",
            }),
            h.rule.style("button", {
              position: "relative",
              left: "105px",
              width: "50px",
              height: "20px",
            }),
          ]),
        ],
      );

      t.equal(isScrolledBehind(device)(button), exp);
    });
  }
}

// testCase: below
for (const overflowX of overflowKeywords) {
  for (const overflowY of overflowKeywords) {
    const exp = expectation("below", overflowX, overflowY);

    test(`isScrolledBehind() is ${exp} for element positioned below container
          with overflow: ${overflowX} ${overflowY}`, (t) => {
      const device = Device.standard();
      const button = (
        <button box={{ device, x: 9, y: 114, width: 50, height: 20 }}>
          foo
        </button>
      );
      const div = (
        <div box={{ device, x: 8, y: 8, width: 102, height: 102 }}>
          {button}
        </div>
      );

      h.document(
        [div],
        [
          h.sheet([
            h.rule.style("div", {
              overflow: `${overflowX} ${overflowY}`,
              width: "100px",
              height: "100px",
            }),
            h.rule.style("button", {
              position: "relative",
              top: "105px",
              width: "50px",
              height: "20px",
            }),
          ]),
        ],
      );

      t.equal(isScrolledBehind(device)(button), exp);
    });
  }
}

// testCase: inside
for (const overflowX of overflowKeywords) {
  for (const overflowY of overflowKeywords) {
    const exp = expectation("inside", overflowX, overflowY);

    test(`isScrolledBehind() is ${exp} for element inside container
          with overflow: ${overflowX} ${overflowY}`, (t) => {
      const device = Device.standard();
      const button = (
        <button box={{ device, x: 9, y: 9, width: 50, height: 20 }}>foo</button>
      );
      const div = (
        <div box={{ device, x: 8, y: 8, width: 102, height: 102 }}>
          {button}
        </div>
      );

      h.document(
        [div],
        [
          h.sheet([
            h.rule.style("div", {
              overflow: `${overflowX} ${overflowY}`,
              width: "100px",
              height: "100px",
            }),
            h.rule.style("button", {
              width: "50px",
              height: "20px",
            }),
          ]),
        ],
      );

      t.equal(isScrolledBehind(device)(button), exp);
    });
  }
}

test(`isScrolledBehind() cannot correctly detect if element without layout is scrolled behind`, (t) => {
  const device = Device.standard();
  const button = <button>foo</button>;
  const div = <div>{button}</div>;

  h.document(
    [div],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "scroll",
          width: "100px",
          height: "100px",
        }),
        h.rule.style("button", {
          position: "relative",
          top: "105px",
          width: "50px",
          height: "20px",
        }),
      ]),
    ],
  );

  // The button is actually scrolled behind since it is below the container which has overflow: scroll,
  // but without layout, the function defaults to returning `false`
  t.equal(isScrolledBehind(device)(button), false);
});
