import * as fs from "fs";
import * as path from "path";

import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Frontier } from "@siteimprove/alfa-frontier";
import { Crawler } from "@siteimprove/alfa-crawler";

import rules from "@siteimprove/alfa-rules";

const [scope, ...seed] = process.argv.slice(2);

if (!scope) {
  console.error("You must pass a URL to the script");
  process.exit(1);
}

const frontier = Frontier.of(scope, [scope, ...seed]);

Crawler.with(async (crawler) => {
  for await (const result of crawler.crawl(frontier)) {
    for (const input of result) {
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
