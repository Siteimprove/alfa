import { test } from "@siteimprove/alfa-test";

import { Frontier } from "@siteimprove/alfa-frontier";

import { Crawler } from "../src/crawler";

const fixture = `file://${__dirname}/fixture`;

test("#crawl() crawls a frontier", async (t) =>
  await Crawler.with(async (crawler) => {
    const frontier = Frontier.of(fixture, [`${fixture}/a.html`]);

    const pages: Array<string> = [];

    for await (const result of crawler.crawl(frontier)) {
      t.equal(result.isOk(), true);

      pages.push(result.get().response.url);
    }

    t.deepEqual(pages, [
      `${fixture}/a.html`,
      `${fixture}/b.html`,
      `${fixture}/c.html`,
    ]);
  }));
