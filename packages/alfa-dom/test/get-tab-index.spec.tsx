import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getTabIndex } from "../src/get-tab-index";

test("getTabIndex() gets the tab index of an anchor with an href attribute", t => {
  const a = <a href="foo">Anchor</a>;
  t.deepEqual(getTabIndex(a, a), Some.of(0));
});

test("getTabIndex() returns none when getting the tab index of an anchor without an href attribute", t => {
  const a = <a>Anchor</a>;
  t.equal(getTabIndex(a, a), None);
});

test("getTabIndex() gets the tab index of an anchor with an href attribute and a tabindex attribute", t => {
  const a = <a tabindex="2">Anchor</a>;
  t.deepEqual(getTabIndex(a, a), Some.of(2));
});

test("getTabIndex() return none when the tab index is not an integer", t => {
  const a = <a tabindex="2.5">Anchor</a>;
  t.equal(getTabIndex(a, a), None);
});

test("getTabIndex() gets the tab index of a video with a controls attribute", t => {
  const video = <video controls />;
  t.deepEqual(getTabIndex(video, video), Some.of(0));
});

test("getTabIndex() returns none when getting the tab index of a video without a controls attribute", t => {
  const video = <video />;
  t.equal(getTabIndex(video, video), None);
});

test("getTabIndex() gets the tab index of a video with a controls attribute and a tabindex attribute", t => {
  const video = <video controls tabindex="2" />;
  t.deepEqual(getTabIndex(video, video), Some.of(2));
});

test("getTabIndex() gets the tab index of a summary that is the first child of a details", t => {
  const summary = <summary />;
  const details = <details>{summary}</details>;
  t.deepEqual(getTabIndex(summary, details), Some.of(0));
});
