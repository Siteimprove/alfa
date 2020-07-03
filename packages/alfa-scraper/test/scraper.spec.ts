import { test } from "@siteimprove/alfa-test";

import { Scraper } from "../src/scraper";

test("#scrape() scrapes a page with a hash fragment", async (t) =>
  await Scraper.with(async (scraper) => {
    const url = `file://${__dirname}/fixture/internal-link.html`;
    const result = await scraper.scrape(url + "#foo");

    t.equal(result.isOk(), true);

    const { response } = result.get();

    t.equal(response.url, url);
  }));

test("#scrape() scrapes a page with an immediate meta refresh", async (t) =>
  await Scraper.with(async (scraper) => {
    const url = `file://${__dirname}/fixture/meta-refresh-immediate.html`;
    const result = await scraper.scrape(url);

    t.equal(result.isOk(), true);

    const { response } = result.get();

    t.equal(response.url, "https://example.com/");
  }));

test("#scrape() scrapes a page with a delayed meta refresh", async (t) =>
  await Scraper.with(async (scraper) => {
    const url = `file://${__dirname}/fixture/meta-refresh-delayed.html`;
    const result = await scraper.scrape(url);

    t.equal(result.isOk(), true);

    const { response } = result.get();

    t.equal(response.url, url);
  }));

test("#scrape() scrapes a page with an immediate location change", async (t) =>
  await Scraper.with(async (scraper) => {
    const url = `file://${__dirname}/fixture/location-change-immediate.html`;
    const result = await scraper.scrape(url);

    t.equal(result.isOk(), true);

    const { response } = result.get();

    t.equal(response.url, "https://example.com/");
  }));

test("#scrape() scrapes a page with a delayed location change", async (t) =>
  await Scraper.with(async (scraper) => {
    const url = `file://${__dirname}/fixture/location-change-delayed.html`;
    const result = await scraper.scrape(url);

    t.equal(result.isOk(), true);

    const { response } = result.get();

    t.equal(response.url, url);
  }));
