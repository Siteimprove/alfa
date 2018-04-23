import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { getTabIndex } from "../src/get-tab-index";

test("Computes the tab index of an anchor with an href attribute", async t => {
  t.is(getTabIndex(<a href="foo">Anchor</a>), 0);
});

test("Returns null when computing the tab index of an anchor without an href attribute", async t => {
  t.is(getTabIndex(<a>Anchor</a>), null);
});

test("Computes the tab index of an anchor with an href attribute and a tab index", async t => {
  t.is(getTabIndex(<a tabindex="2">Anchor</a>), 2);
});

test("Computes the tab index of a video with a controls attribute", async t => {
  t.is(getTabIndex(<video controls />), 0);
});

test("Returns null when computing the tab index of a video without a controls attribute", async t => {
  t.is(getTabIndex(<video />), null);
});

test("Computes the tab index of a video with a controls attribute and a tab index", async t => {
  t.is(getTabIndex(<video controls tabindex="2" />), 2);
});
