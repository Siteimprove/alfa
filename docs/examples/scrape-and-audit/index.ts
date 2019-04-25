import * as fs from "fs";
import * as path from "path";

import { audit, toJson } from "../../../packages/alfa-act";
import { Seq } from "../../../packages/alfa-collection";
import {
  Document,
  getAttribute,
  getNextElementSibling,
  querySelector,
  querySelectorAll
} from "../../../packages/alfa-dom";
import { Scraper } from "../../../packages/alfa-scrape";
import { values } from "../../../packages/alfa-util";
import { Rules } from "../../../packages/alfa-wcag";

const scraper = new Scraper();

const site = "https://alphagov.github.io/accessibility-tool-audit";

scraper.scrape(`${site}/test-cases.html`).then(async page => {
  for (const { id, url } of getUrls(page.document)) {
    const page = await scraper.scrape(`${site}/${url}`);

    const { results } = audit(page, values(Rules));

    process.stdout.write(`${url}\n`);

    fs.writeFileSync(
      path.join(__dirname, "result", `${id}.json`),
      JSON.stringify(toJson(results, page), null, 2)
    );
  }

  await scraper.close();
});

function getUrls(
  document: Document
): Iterable<{ readonly id: string; readonly url: string }> {
  return Seq(querySelectorAll(document, document, "h3[id]")).map(header => {
    const example = getNextElementSibling(header, document);
    const id = getAttribute(header, "id")!;

    if (example !== null) {
      const anchor = querySelector(
        example,
        document,
        "a[href^='example-pages/']"
      );

      if (anchor !== null) {
        return { id, url: getAttribute(anchor, "href")! };
      }
    }

    const anchor = querySelector(header, document, "a")!;

    return { id, url: getAttribute(anchor, "href")! };
  });
}
