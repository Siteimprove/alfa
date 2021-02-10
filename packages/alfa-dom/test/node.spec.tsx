import { test } from "@siteimprove/alfa-test";

import { h } from "../h";
import { jsx } from "../jsx";

test("#tabOrder() returns the tab order of a node", (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {a}
      {b}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test("#tabOrder() correctly handles explicitly ordered tab indices", (t) => {
  const a = <button tabindex="2" />;
  const b = <button tabindex="1" />;
  const c = <button />;

  const div = (
    <div>
      {a}
      {b}
      {c}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [b, a, c]);
});

test(`#tabOrder() correctly handles shadow roots with slotted elements before
      the shadow contents`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {h.shadow([<slot />, b])}
      {a}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test(`#tabOrder() correctly handles shadow roots with slotted elements after the
      shadow contents`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {h.shadow([b, <slot />])}
      {a}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [b, a]);
});
