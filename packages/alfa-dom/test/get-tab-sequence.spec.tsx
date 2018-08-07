import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getTabSequence } from "../src/get-tab-sequence";

test("Computes the tab sequence of three non-prioritized elements", t => {
  const div = <div />;
  const a = <a href="#" />;
  const input = <input type="text" />;

  const context = (
    <div>
      {div}
      {a}
      {input}
    </div>
  );

  t.deepEqual(getTabSequence(context, context), [a, input]);
});

test("Computes the tab sequence of three elements with priotization", t => {
  const div = <div />;
  const a = <a href="#" />;
  const input = <input tabindex="1" type="text" />;

  const context = (
    <div>
      {div}
      {a}
      {input}
    </div>
  );

  t.deepEqual(getTabSequence(context, context), [input, a]);
});

test("Computes the tab sequence of three elements with ignoring priotization", t => {
  const div = <div />;
  const a = <a href="#" />;
  const input = <input tabindex="-1" type="text" />;

  const context = (
    <div>
      {div}
      {a}
      {input}
    </div>
  );

  t.deepEqual(getTabSequence(context, context), [a]);
});

test("Computes the tab sequence of colliding elements", t => {
  const div = <div />;
  const button = <button />;
  const a = <a tabindex="1" href="#" />;
  const input = <input tabindex="1" type="text" />;

  const context = (
    <div>
      {div}
      {button}
      {a}
      {input}
    </div>
  );

  t.deepEqual(getTabSequence(context, context), [a, input, button]);
});

test("Computes the tab sequence of three elements with out of bounds priotization", t => {
  const div = <div />;
  const a = <a tabindex="6" href="#" />;
  const input = <input tabindex="2" type="text" />;

  const context = (
    <div>
      {div}
      {a}
      {input}
    </div>
  );

  t.deepEqual(getTabSequence(context, context), [input, a]);
});
