import * as fs from "fs";
import * as path from "path";

import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Scraper } from "@siteimprove/alfa-scraper";

import rules from "@siteimprove/alfa-rules";

const [url] = process.argv.slice(2);

if (!url) {
  console.error("You must pass a URL to the script");
  process.exit(1);
}

Scraper.with(async (scraper) => {
  for (const input of await scraper.scrape(url)) {
    const outcomes = await Audit.of(input, rules)
      .evaluate()
      .map((outcomes) => [...outcomes]);

    const earl = outcomes.map((outcome) => outcome.toEARL());

    const url = new URL(input.response.url);

    console.group(url.href);
    logStats(outcomes);
    console.groupEnd();

    const file =
      path.join(
        __dirname,
        "outcomes",
        url.host,
        url.pathname.replace(/\/$/, "")
      ) + ".json";

    fs.mkdirSync(path.dirname(file), { recursive: true });

    fs.writeFileSync(file, JSON.stringify(earl, null, 2));
  }
});

function logStats<I, T, Q>(outcomes: Array<Outcome<I, T, Q>>): void {
  console.log(outcomes.filter(Outcome.isPassed).length, "passed outcomes");

  console.log(outcomes.filter(Outcome.isFailed).length, "failed outcomes");

  console.log(
    outcomes.filter(Outcome.isInapplicable).length,
    "inapplicable rules"
  );
}
