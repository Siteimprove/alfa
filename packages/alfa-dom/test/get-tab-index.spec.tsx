import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getTabIndex } from "../src/get-tab-index";

test("Computes the tab index of an anchor with an href attribute", t => {
  t.equal(getTabIndex(<a href="foo">Anchor</a>), 0);
});

test("Returns null when computing the tab index of an anchor without an href attribute", t => {
  t.equal(getTabIndex(<a>Anchor</a>), null);
});

test("Computes the tab index of an anchor with an href attribute and a tab index", t => {
  t.equal(getTabIndex(<a tabindex="2">Anchor</a>), 2);
});

test("Computes the tab index of a video with a controls attribute", t => {
  t.equal(getTabIndex(<video controls />), 0);
});

test("Returns null when computing the tab index of a video without a controls attribute", t => {
  t.equal(getTabIndex(<video />), null);
});

test("Computes the tab index of a video with a controls attribute and a tab index", t => {
  t.equal(getTabIndex(<video controls tabindex="2" />), 2);
});
