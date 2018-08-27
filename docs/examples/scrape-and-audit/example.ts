import { audit, isResult, toJson } from "../../../packages/alfa-act";
import {
  Document,
  getAttribute,
  getNextElementSibling,
  querySelector,
  querySelectorAll
} from "../../../packages/alfa-dom";
import { Scraper } from "../../../packages/alfa-scrape";
import { Rules } from "../../../packages/alfa-wcag";

import { removeDirectory, writeFile } from "../../../build/helpers/file-system";
import * as notify from "../../../build/helpers/notify";

const scraper = new Scraper();

const site = "https://alphagov.github.io/accessibility-tool-audit";

scraper.scrape(`${site}/test-cases.html`).then(async page => {
  removeDirectory("docs/examples/scrape-and-audit/result");

  for (const { id, url } of getUrls(page.document)) {
    const page = await scraper.scrape(`${site}/${url}`);

    const results = audit(page, Rules).filter(isResult);

    notify.success(url);

    writeFile(
      `docs/examples/scrape-and-audit/result/${id}.json`,
      JSON.stringify(toJson(results, page), null, 2)
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
