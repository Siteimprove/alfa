import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { getDefaultDevice } from "@siteimprove/alfa-device";
import { None, Some } from "@siteimprove/alfa-option";
import { getOwnerElement } from "../src/get-owner-element";

const device = getDefaultDevice();

test("getOwnerElement() gets the implicit owner of an element", t => {
  const li = <li />;
  const ul = <ul>{li}</ul>;

  t.deepEqual(getOwnerElement(li, ul, device).toJSON(), {
    values: [
      {
        value: Some.of(ul),
        branches: null
      }
    ]
  });
});

test("getOwnerElement() gets the explicit owner of an element", t => {
  const listitem = <div role="listitem" id="foo" />;
  const list = <div role="list" aria-owns="foo" />;
  const context = (
    <div>
      {list}
      {listitem}
    </div>
  );

  t.deepEqual(getOwnerElement(listitem, context, device).toJSON(), {
    values: [
      {
        value: Some.of(list),
        branches: null
      }
    ]
  });
});

test("getOwnerElement() ignores ancestors not in the accessibility tree", t => {
  const listitem = <div role="listitem" />;
  const list = (
    <div role="list">
      <div role="none">{listitem}</div>
    </div>
  );

  t.deepEqual(getOwnerElement(listitem, list, device).toJSON(), {
    values: [
      {
        value: Some.of(list),
        branches: null
      }
    ]
  });
});

test("getOwnerElement() returns none for elements not in the accessibility tree", t => {
  const listitem = <div role="listitem" aria-hidden="true" />;
  const list = <div role="list">{listitem}</div>;

  t.deepEqual(getOwnerElement(listitem, list, device).toJSON(), {
    values: [
      {
        value: None,
        branches: null
      }
    ]
  });
});
