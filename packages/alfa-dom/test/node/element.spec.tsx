import { test } from "@siteimprove/alfa-test";

import { jsx } from "../../jsx";

test("#tabIndex() returns the tab index explicitly assigned to an element", (t) => {
  t.equal((<div tabindex="42" />).tabIndex().get(), 42);
});

test("#tabIndex() returns 0 for an <a> element with an href attribute", (t) => {
  t.equal((<a href="#" />).tabIndex().get(), 0);
});

test("#tabIndex() returns None for an <a> element without an href attribute", (t) => {
  t.equal((<a />).tabIndex().isNone(), true);
});

test("#tabIndex() returns 0 for a <button> element", (t) => {
  t.equal((<button />).tabIndex().get(), 0);
});

test(`#tabIndex() returns 0 for a <summary> element that is the first <summary>
      child element of a <details> element`, (t) => {
  const summary = <summary />;

  <details>{summary}</details>;

  t.equal(summary.tabIndex().get(), 0);
});

test(`#tabIndex() returns None for a <summary> element that is not the child of
      a <details> elements`, (t) => {
  t.equal((<summary />).tabIndex().isNone(), true);
});

test(`#tabIndex() returns None for a <summary> element that is not the first
      <summary> child element of a <details> elements`, (t) => {
  const summary = <summary />;

  <details>
    <summary />
    {summary}
  </details>;

  t.equal(summary.tabIndex().isNone(), true);
});
