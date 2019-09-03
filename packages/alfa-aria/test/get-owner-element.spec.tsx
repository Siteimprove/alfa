import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getOwnerElement } from "../src/get-owner-element";

const device = getDefaultDevice();

test("Returns the implicit owner of an element", t => {
  const li = <li />;
  const ul = <ul>{li}</ul>;

  t.deepEqual(getOwnerElement(li, ul, device), ul);
});

test("Returns the explicit owner of an element", t => {
  const listitem = <div role="listitem" id="foo" />;
  const list = <div role="list" aria-owns="foo" />;
  const context = (
    <div>
      {list}
      {listitem}
    </div>
  );

  t.deepEqual(getOwnerElement(listitem, context, device), list);
});

test("Ignores ancestors not in the accessibility tree", t => {
  const listitem = <div role="listitem" />;
  const list = (
    <div role="list">
      <div role="none">{listitem}</div>
    </div>
  );

  t.deepEqual(getOwnerElement(listitem, list, device), list);
});

test("Elements not in the accessibility tree have no owners", t => {
  const listitem = <div role="listitem" aria-hidden="true" />;
  const list = <div role="list">{listitem}</div>;

  t.deepEqual(getOwnerElement(listitem, list, device), null);
});
