import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getTabIndex } from "../src/get-tab-index";

test("Computes the tab index of an anchor with an href attribute", t => {
  const a = <a href="foo">Anchor</a>;
  t.equal(getTabIndex(a, a), 0);
});

test("Returns null when computing the tab index of an anchor without an href attribute", t => {
  const a = <a>Anchor</a>;
  t.equal(getTabIndex(a, a), null);
});

test("Computes the tab index of an anchor with an href attribute and a tab index", t => {
  const a = <a tabindex="2">Anchor</a>;
  t.equal(getTabIndex(a, a), 2);
});

test("Returns null when the tab index is not an integer", t => {
  const a = <a tabindex="2.5">Anchor</a>;
  t.equal(getTabIndex(a, a), null);
});

test("Computes the tab index of a video with a controls attribute", t => {
  const video = <video controls />;
  t.equal(getTabIndex(video, video), 0);
});

test("Returns null when computing the tab index of a video without a controls attribute", t => {
  const video = <video />;
  t.equal(getTabIndex(video, video), null);
});

test("Computes the tab index of a video with a controls attribute and a tab index", t => {
  const video = <video controls tabindex="2" />;
  t.equal(getTabIndex(video, video), 2);
});

test("Computes the tab index of a summary that is the first child of a details", t => {
  const summary = <summary />;
  const details = <details>{summary}</details>;
  t.equal(getTabIndex(summary, details), 0);
});
