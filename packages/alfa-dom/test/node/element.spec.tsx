import { test } from "@siteimprove/alfa-test";

test("#tabIndex() returns the tab index explicitly assigned to an element", (t) => {
  t.equal((<div tabindex="42" />).tabIndex().getUnsafe(), 42);
});

test("#tabIndex() ignores characters after the first non-digit", (t) => {
  t.equal((<div tabindex="-1-toRemove" />).tabIndex().getUnsafe(), -1);
});

test("#tabIndex() returns 0 for an <a> element with an href attribute", (t) => {
  t.equal((<a href="#" />).tabIndex().getUnsafe(), 0);
});

test("#tabIndex() returns None for an <a> element without an href attribute", (t) => {
  t.equal((<a />).tabIndex().isNone(), true);
});

test("#tabIndex() returns None for a <div> element with tabindex null", (t) => {
  t.equal((<div tabindex="null" />).tabIndex().isNone(), true);
});

test("#tabIndex() returns 0 for a <button> element", (t) => {
  t.equal((<button />).tabIndex().getUnsafe(), 0);
});

test(`#tabIndex() returns 0 for a <summary> element that is the first <summary>
      child element of a <details> element`, (t) => {
  const summary = <summary />;

  <details>{summary}</details>;

  t.equal(summary.tabIndex().getUnsafe(), 0);
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
