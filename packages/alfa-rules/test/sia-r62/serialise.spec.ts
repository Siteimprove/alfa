import { Origin } from "@siteimprove/alfa-cascade";
import { Device } from "@siteimprove/alfa-device";
import { Declaration } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";
import { test } from "@siteimprove/alfa-test";
import { Serialise } from "../../dist/sia-r62/serialise.js";

const { background } = Serialise;
const device = Device.standard();

function mkStyle(properties: Array<[string, string]>): Style {
  return Style.of(
    properties.map(([name, value]) => [
      Declaration.of(name, value),
      Origin.NormalAuthor,
    ]),
    device,
  );
}

test(`background() serialises a simple background color`, (t) => {
  const style = mkStyle([["background-color", "red"]]);

  t.deepEqual(background(style), "rgb(100% 0% 0%)");
});

test(`background() serialises a single layer background`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "url(a)"],
    ["background-attachment", "scroll"], // initial value is trimmed
    ["background-origin", "border-box"], // initial value of clip, hence shared
  ]);

  t.deepEqual(background(style), "rgb(100% 0% 0%) url(a) border-box");
});

test(`background() serialises a complex single layer background`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "url(a)"],
    ["background-position-x", "10px"],
    ["background-position-y", "center"],
    ["background-size", "50%"],
    ["background-repeat-x", "space"],
    ["background-repeat-y", "no-repeat"],
    ["background-attachment", "fixed"],
    ["background-origin", "content-box"],
    ["background-clip", "padding-box"],
  ]);

  t.deepEqual(
    background(style),
    "rgb(100% 0% 0%) url(a) left 10px center / 50% auto space no-repeat fixed content-box padding-box",
  );
});

test(`background() keeps initial background-clip if needed`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "url(a)"],
    ["background-attachment", "fixed"],
    ["background-origin", "content-box"],
  ]);

  t.deepEqual(
    background(style),
    "rgb(100% 0% 0%) url(a) fixed content-box border-box",
  );
});

test(`background() keeps initial background-origin if needed`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "url(a)"],
    ["background-attachment", "fixed"],
    ["background-clip", "content-box"],
  ]);

  t.deepEqual(
    background(style),
    "rgb(100% 0% 0%) url(a) fixed padding-box content-box",
  );
});

test(`background() adds a position when seeing a size`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "url(a)"],
    ["background-size", "50%"],
  ]);

  t.deepEqual(background(style), "rgb(100% 0% 0%) url(a) 0px 0px / 50% auto");
});

test(`background() mixes and matches layers`, (t) => {
  const style = mkStyle([
    ["background-image", "url(a), url(b)"],
    ["background-attachment", "fixed, scroll"],
    ["background-origin", "border-box, content-box"],
  ]);

  t.deepEqual(
    background(style),
    "url(a) fixed border-box, url(b) content-box border-box",
  );
});

test(`background() only adds background-color to the last layer`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "url(a), url(b)"],
  ]);

  t.deepEqual(background(style), "url(a), rgb(100% 0% 0%) url(b)");
});

test(`background skips non-last layers without image`, (t) => {
  const style = mkStyle([
    ["background-color", "red"],
    ["background-image", "none, url(a), none"],
    ["background-attachment", "fixed, fixed, fixed"],
  ]);

  t.deepEqual(background(style), "url(a) fixed, rgb(100% 0% 0%)");
});

test(`background defaults to first layer on missing ones`, (t) => {
  const style = mkStyle([
    ["background-image", "url(a), url(b), url(c)"],
    ["background-attachment", "fixed, local"],
  ]);

  t.deepEqual(background(style), "url(a) fixed, url(b) local, url(c) fixed");
});

test(`background correctly shortens background-repeat`, (t) => {
  const repeat = ["repeat", "no-repeat", "space", "round"];

  for (const x of repeat) {
    for (const y of repeat) {
      const style = mkStyle([
        ["background-image", "url(a)"],
        ["background-repeat-x", x],
        ["background-repeat-y", y],
      ]);

      const actual = background(style);
      const expected =
        x === y
          ? x === "repeat"
            ? ""
            : x
          : x === "repeat" && y === "no-repeat"
            ? "repeat-x"
            : x === "no-repeat" && y === "repeat"
              ? "repeat-y"
              : x + " " + y;

      t.deepEqual(actual, ("url(a) " + expected).trim());
    }
  }
});
