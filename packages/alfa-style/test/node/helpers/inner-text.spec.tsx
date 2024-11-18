import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../../dist/style.js";

const device = Device.standard();

const innerText = Style.innerText(device);

test("innerText() extracts the inner text of an element", (t) => {
  const element = <span>X</span>;

  t.equal(innerText(element), "X");
});

test("innerText() concatenates the inner text of a nested elements", (t) => {
  const element = (
    <span>
      X<span>Y</span>
      <span>Z</span>
    </span>
  );

  t.equal(innerText(element), "XYZ");
});

test("innerText() adds line breaks around block elements", (t) => {
  const element = <div>X</div>;
  h.document([element]);

  t.equal(innerText(element), "\nX\n");
});

test("innerText() adds two line breaks around <p> elements", (t) => {
  const element = <p>X</p>;
  h.document([element]);

  t.equal(innerText(element), "\n\nX\n\n");
});

test("innerText() replaces <br> elements with new lines", (t) => {
  const element = (
    <span>
      X<br />Y
    </span>
  );

  t.equal(innerText(element), "X\nY");
});

test("innerText() does not include non-rendered elements", (t) => {
  const element = (
    <div>
      X<p style={{ display: "none" }}>Y</p>
    </div>
  );
  h.document([element]);

  t.equal(innerText(element), "\nX\n");
});

test("innerText() does not include non-acceptable elements", (t) => {
  const element = (
    <div>
      X<span>ignore</span>
    </div>
  );
  h.document([element]);

  t.equal(
    Style.innerText(
      device,
      (device) => (text) => text.data !== "ignore",
    )(element),
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

  t.equal(Style.innerText(device, Style.isVisible)(element), "Hello world!");
});

test("innerText() adds spaces around tables cells and rows, and newline around captions", (t) => {
  const element = (
    <table>
      <caption>Caption</caption>
      <tbody>
        <tr>
          <td>X</td>
          <td>Y</td>
        </tr>
      </tbody>
    </table>
  );
  h.document([element]);

  // \n are wrapping the full table, and the caption; HTML would collapse them.
  // \n wrapping the full result are trimmed by HTML, not by us.
  // whitespace are wrapping the row, and each cell; HTML would use TAB instead.
  t.equal(innerText(element), "\n\nCaption\n  X  Y  \n");
});
