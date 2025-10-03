import { describe, it } from "vitest";

import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "../../../dist/style.js";

import { isScrolledBehind } from "../../../dist/node/predicate/is-scrolled-behind.js";

const keywords = ["visible", "hidden", "clip", "scroll", "auto"] as const;

enum OffsetX {
  Left = -100,
  Center = 0,
  Right = 100,
}

enum OffsetY {
  Top = -100,
  Center = 0,
  Bottom = 100,
}

type Keyword = (typeof keywords)[number];

function expectation(
  offsetX: OffsetX,
  offsetY: OffsetY,
  computedOverflowX: Keyword,
  computedOverflowY: Keyword,
) {
  switch (offsetX) {
    case OffsetX.Center:
      switch (offsetY) {
        case OffsetY.Bottom:
          return computedOverflowY === "auto" || computedOverflowY === "scroll";
      }
      break;
    case OffsetX.Right:
      switch (offsetY) {
        case OffsetY.Center:
          return computedOverflowX === "auto" || computedOverflowX === "scroll";
        case OffsetY.Bottom:
          return (
            (computedOverflowX === "auto" || computedOverflowX === "scroll") &&
            (computedOverflowY === "auto" || computedOverflowY === "scroll")
          );
      }
      break;
  }

  return false;
}

// There are 3 * 3 * 5 * 5 = 225 combinations
const combinations: Array<[number, number, Keyword, Keyword]> = [];
for (const offsetX of [-100, 0, 100]) {
  for (const offsetY of [-100, 0, 100]) {
    for (const overflowX of keywords) {
      for (const overflowY of keywords) {
        combinations.push([offsetX, offsetY, overflowX, overflowY]);
      }
    }
  }
}

describe("combinatorial test", () => {
  const device = Device.standard();
  const context = Context.empty();

  it.for(combinations)(
    "offsetX: %i, offsetY: %i, overflowX: %s, overflowY: %s",
    ([offsetX, offsetY, overflowX, overflowY], { expect }) => {
      const button = (
        <button
          box={{
            device,
            x: 134 + offsetX,
            y: 141 + offsetY,
            width: 50,
            height: 20,
          }}
        >
          foo
        </button>
      );
      const div = (
        <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
          {button}
        </div>
      );

      h.document(
        [div],
        [
          h.sheet([
            h.rule.style("div", {
              overflowX,
              overflowY,
              margin: "100px 100px",
              width: "100px",
              height: "100px",
            }),
            h.rule.style("button", {
              position: "relative",
              width: "50px",
              height: "20px",
              top: `${40 + offsetY}px`,
              left: `${25 + offsetX}px`,
            }),
          ]),
        ],
      );

      const computedOverflowX = Style.from(div, device, context).computed(
        "overflow-x",
      ).value.value;
      const computedOverflowY = Style.from(div, device, context).computed(
        "overflow-y",
      ).value.value;

      const expn = expectation(
        offsetX,
        offsetY,
        computedOverflowX,
        computedOverflowY,
      );

      expect(isScrolledBehind(device)(button)).toBe(expn);
    },
  );
});

describe("isScrolledBehind", () => {
  it("returns true for text scrolled behind", ({ expect }) => {
    const device = Device.standard();
    const text = h.text("foo");
    const button = (
      <button
        box={{
          device,
          x: 234,
          y: 141,
          width: 50,
          height: 20,
        }}
      >
        {text}
      </button>
    );
    const div = (
      <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
        {button}
      </div>
    );

    h.document(
      [div],
      [
        h.sheet([
          h.rule.style("div", {
            overflow: "scroll",
            margin: "100px 100px",
            width: "100px",
            height: "100px",
          }),
          h.rule.style("button", {
            position: "relative",
            width: "50px",
            height: "20px",
            top: "40px",
            left: "125px",
          }),
        ]),
      ],
    );

    expect(isScrolledBehind(device)(text)).toBe(true);
  });

  it("returns false for text in scroll port", ({ expect }) => {
    const device = Device.standard();
    const text = h.text("foo");
    const button = (
      <button
        box={{
          device,
          x: 134,
          y: 141,
          width: 50,
          height: 20,
        }}
      >
        {text}
      </button>
    );
    const div = (
      <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
        {button}
      </div>
    );

    h.document(
      [div],
      [
        h.sheet([
          h.rule.style("div", {
            overflow: "scroll",
            margin: "100px 100px",
            width: "100px",
            height: "100px",
          }),
          h.rule.style("button", {
            position: "relative",
            width: "50px",
            height: "20px",
            top: "40px",
            left: "125px",
          }),
        ]),
      ],
    );

    expect(isScrolledBehind(device)(text)).toBe(false);
  });

  it("cannot correctly detect if text content of the scroll container is scrolled behind", ({
    expect,
  }) => {
    const device = Device.standard();
    const text = h.text("foo");
    const div = (
      <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        {text}
      </div>
    );

    h.document(
      [div],
      [
        h.sheet([
          h.rule.style("div", {
            overflow: "scroll",
            margin: "100px 100px",
            width: "100px",
            height: "100px",
          }),
        ]),
      ],
    );

    // The text is pushed below the scroll port by the <br />s, but since it doesn't have
    // a bounding box and no parent element other than the scroll container itself,
    // our implementation is not able to detect that it's scrolled behind.
    expect(isScrolledBehind(device)(text)).toBe(false);
  });

  it("returns true when element is not scrolled behind its parent, but the parent is scrolled behind", ({
    expect,
  }) => {
    //
    //    +----------+
    //    |          |
    //    |          | +- - - - -+
    //    |          | .         .
    //    |          | .   +---+ .
    //    |          | .   |   | .
    //    |          | .   +---+ .
    //    |          | +- - - - -+
    //    |__________|
    //    |<|##____|>|
    //

    const device = Device.standard();
    const button = (
      <button
        box={{
          device,
          x: 230,
          y: 122,
          width: 50,
          height: 20,
        }}
      >
        foo
      </button>
    );
    const outer = (
      <div
        class="outer"
        box={{ device, x: 108, y: 100, width: 102, height: 102 }}
      >
        <div
          class="inner"
          box={{ device, x: 229, y: 121, width: 62, height: 62 }}
        >
          {button}
        </div>
      </div>
    );

    h.document(
      [outer],
      [
        h.sheet([
          h.rule.style("div.outer", {
            overflow: "auto",
            margin: "100px 100px",
            width: "100px",
            height: "100px",
          }),
          h.rule.style("div.inner", {
            position: "relative",
            top: "20px",
            left: "120px",
            width: "60px",
            height: "60px",
          }),
          h.rule.style("button", {
            width: "50px",
            height: "20px",
          }),
        ]),
      ],
    );

    expect(isScrolledBehind(device)(button)).toBe(true);
  });

  it("returns true when element is not scrolled behind its parent, and the parent is not scrolled behind, but the element is scrolled behind the outer ancestor", ({
    expect,
  }) => {
    //
    //    +----------+
    //    |          |
    //    |  +-------| - - - -+
    //    |  |       |        .
    //    |  |       |  +---+ .
    //    |  |       |  |   | .
    //    |  |       |  +---+ .
    //    |  +-------| - - - -+
    //    |__________|
    //    |<|##____|>|
    //

    const device = Device.standard();
    const button = (
      <button
        box={{
          device,
          x: 240,
          y: 122,
          width: 50,
          height: 20,
        }}
      >
        foo
      </button>
    );
    const outer = (
      <div
        class="outer"
        box={{ device, x: 108, y: 100, width: 102, height: 102 }}
      >
        <div
          class="inner"
          box={{ device, x: 169, y: 121, width: 122, height: 62 }}
        >
          {button}
        </div>
      </div>
    );

    h.document(
      [outer],
      [
        h.sheet([
          h.rule.style("div.outer", {
            overflow: "auto",
            margin: "100px 100px",
            width: "100px",
            height: "100px",
          }),
          h.rule.style("div.inner", {
            position: "relative",
            top: "20px",
            left: "60px",
            width: "120px",
            height: "60px",
          }),
          h.rule.style("button", {
            position: "relative",
            left: "70px",
            width: "50px",
            height: "20px",
          }),
        ]),
      ],
    );

    expect(isScrolledBehind(device)(button)).toBe(true);
  });

  it("cannot correctly detect if element without layout is scrolled behind", ({
    expect,
  }) => {
    const device = Device.standard();
    const button = <button>foo</button>;
    const div = <div>{button}</div>;

    h.document(
      [div],
      [
        h.sheet([
          h.rule.style("div", {
            overflow: "scroll",
            margin: "100px 100px",
            width: "100px",
            height: "100px",
          }),
          h.rule.style("button", {
            position: "relative",
            width: "50px",
            height: "20px",
            top: "40px",
            left: "calc(25px + 100px)",
          }),
        ]),
      ],
    );

    // The button is actually scrolled behind to the right of the container,
    // but without layout the function always returns `false`
    expect(isScrolledBehind(device)(button)).toBe(false);
  });
});
