import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { hasTransparentBackground } from "../../../src/common/predicate/has-transparent-background";

const device = Device.standard();

test("hasTransparentBackground() fails on image which is not transparent", (t) => {
  const target = <img src="foo.jpg" />;

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("<div> has a color background", (t) => {
  const target = <div style={{ backgroundColor: "red" }}> Hello</div>;

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("<div> has an image background", (t) => {
  const target = (
    <div
      style={{
        backgroundImage:
          "linear-gradient(to right, #046B99 50%, transparent 50%)",
      }}
    >
      Hello
    </div>
  );

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("<div> background is not transparent when one child background isn't", (t) => {
  const target = (
    <div>
      <span> First </span>
      <span> Second </span>
      <span style={{ backgroundColor: "#005BBB" }}> Third</span>
    </div>
  );

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("<div> background is transparent when all children backgrounds are transparent", (t) => {
  const target = (
    <div>
      <span> First </span>
      <span> Second </span>
      <span> Third</span>
    </div>
  );

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), true);
});

test("<div> background is transparent", (t) => {
  const target = <div> Hello</div>;

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), true);
});
