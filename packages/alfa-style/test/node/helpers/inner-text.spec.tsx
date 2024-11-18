import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../../dist/style.js";

const { innerText } = Style;

const device = Device.standard();

const all = () => true;

test("innerText() extracts the inner text of an element", (t) => {
  const element = <span>X</span>;

  t.equal(innerText(all, element, device), "X");
});

test("innerText() concatenates the inner text of a nested elements", (t) => {
  const element = (
    <span>
      X<span>Y</span>
      <span>Z</span>
    </span>
  );

  t.equal(innerText(all, element, device), "XYZ");
});

test("innerText() adds line breaks around block elements", (t) => {
  const element = <div>X</div>;
  h.document([element]);

  t.equal(innerText(all, element, device), "\nX\n");
});

test("innerText() adds two line breaks around <p> elements", (t) => {
  const element = <p>X</p>;
  h.document([element]);

  t.equal(innerText(all, element, device), "\n\nX\n\n");
});

test("innerText() replaces <br> elements with new lines", (t) => {
  const element = (
    <span>
      X<br />Y
    </span>
  );

  t.equal(innerText(all, element, device), "X\nY");
});

test("innerText() does not include non-rendered elements", (t) => {
  const element = (
    <div>
      X<p style={{ display: "none" }}>Y</p>
    </div>
  );
  h.document([element]);

  t.equal(innerText(all, element, device), "\nX\n");
});

test("innerText() does not include non-acceptable elements", (t) => {
  const element = (
    <div>
      X<span>ignore</span>
    </div>
  );
  h.document([element]);

  t.equal(
    innerText((text) => text.data !== "ignore", element, device),
    "\nX\n",
  );
});

test("innerText() keeps text of whitespace only elements", (t) => {
  const element = (
    <span>
      Hello<span> </span>world!
    </span>
  );
  h.document([element]);

  t.equal(innerText(Style.isVisible(device), element, device), "Hello world!");
});
