import * as fs from "fs";
import { Scraper } from "@siteimprove/alfa-scrape";
import {
  Document,
  querySelector,
  querySelectorAll,
  getAttribute,
  getNextElementSibling,
  serialize
} from "@siteimprove/alfa-dom";
import { audit } from "@siteimprove/alfa-act";
import { Rules } from "@siteimprove/alfa-wcag";

const scraper = new Scraper();

const site = "https://alphagov.github.io/accessibility-tool-audit";

scraper.scrape(`${site}/test-cases.html`).then(async page => {
  fs.rmdirSync("docs/examples/scrape-and-check/result");

  for (const { id, url } of getUrls(page.document)) {
    console.log("Auditing", url);

    const page = await scraper.scrape(`${site}/${url}`);

    const results = audit(page, Rules).map(result => {
      if ("target" in result && result.target !== undefined) {
        return { ...result, target: serialize(result.target, result.target) };
      }

      return result;
    });

    fs.writeFileSync(
      `docs/examples/scrape-and-check/result/${id}.json`,
      JSON.stringify(results, null, 2)
    );
  }

  await scraper.close();
});

function getUrls(
  document: Document
): Array<Readonly<{ id: string; url: string }>> {
  return querySelectorAll(document, document, "h3[id]").map(header => {
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
