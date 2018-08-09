import { audit } from "../../../packages/alfa-act";
import {
  Document,
  getAttribute,
  getNextElementSibling,
  querySelector,
  querySelectorAll,
  serialize
} from "../../../packages/alfa-dom";
import { Scraper } from "../../../packages/alfa-scrape";
import { Rules } from "../../../packages/alfa-wcag";

import { removeDirectory, writeFile } from "../../../build/helpers/file-system";

const scraper = new Scraper();

const site = "https://alphagov.github.io/accessibility-tool-audit";

scraper.scrape(`${site}/test-cases.html`).then(async page => {
  removeDirectory("docs/examples/scrape-and-audit/result");

  for (const { id, url } of getUrls(page.document)) {
    process.stdout.write(`Auditing ${url}\n`);

    const page = await scraper.scrape(`${site}/${url}`);

    const results = audit(page, Rules).map(result => {
      if ("target" in result && result.target !== undefined) {
        return { ...result, target: serialize(result.target, result.target) };
      }

      return result;
    });

    writeFile(
      `docs/examples/scrape-and-audit/result/${id}.json`,
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
