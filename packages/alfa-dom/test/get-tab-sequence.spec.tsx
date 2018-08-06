import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getTabSequence } from "../src/get-tab-sequence";

test("Computes the tab sequence of three non-prioritized elements", t => {
  const a1 = <a href="#">Foo</a>;
  const a2 = <a href="#">Bar</a>;
  const input = <input type="text" value="Hello" />;

  t.deepEqual(
    getTabSequence(
      <div id="root">
        {a1}
        {a2}
        {input}
      </div>
    ),
    [a1, a2, input]
  );
});

test("Computes the tab sequence of three elements with priotization", t => {
  const a1 = <a href="#">Foo</a>;
  const a2 = (
    <a tabindex="1" href="#">
      Bar
    </a>
  );
  const input = <input type="text" value="Hello" />;

  t.deepEqual(
    getTabSequence(
      <div id="root">
        {a1}
        {a2}
        {input}
      </div>
    ),
    [a2, a1, input]
  );
});

test("Computes the tab sequence of three elements with ignoring priotization", t => {
  const a1 = <a href="#">Foo</a>;
  const a2 = <a href="#">Bar</a>;
  const input = <input tabindex="-1" type="text" value="Hello" />;

  t.deepEqual(
    getTabSequence(
      <div id="root">
        {a1}
        {a2}
        {input}
      </div>
    ),
    [a1, a2]
  );
});

test("Computes the tab sequence of colliding elements", t => {
  const a1 = (
    <a tabindex="1" href="#">
      Foo
    </a>
  );
  const a2 = (
    <a tabindex="1" href="#">
      Bar
    </a>
  );
  const input = <input type="text" value="Hello" />;

  t.deepEqual(
    getTabSequence(
      <div id="root">
        {a1}
        {a2}
        {input}
      </div>
    ),
    [a1, a2, input]
  );
});

test("Computes the tab sequence of three elements with out of bounds priotization", t => {
  const a1 = <a href="#">Foo</a>;
  const a2 = (
    <a tabindex="6" href="#">
      Bar
    </a>
  );
  const input = <input tabindex="2" type="text" value="Hello" />;

  t.deepEqual(
    getTabSequence(
      <div id="root">
        {a1}
        {a2}
        {input}
      </div>
    ),
    [input, a2, a1]
  );
});
