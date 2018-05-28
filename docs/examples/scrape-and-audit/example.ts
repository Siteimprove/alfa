import { write, remove } from "@foreman/fs";
import { notify } from "@foreman/notify";
import { Scraper } from "@siteimprove/alfa-scrape";
import {
  Document,
  find,
  findAll,
  getAttribute,
  getNextElementSibling,
  serialize
} from "@siteimprove/alfa-dom";
import { audit } from "@siteimprove/alfa-act";
import { Rules } from "@siteimprove/alfa-wcag";

const scraper = new Scraper();

const site = "https://alphagov.github.io/accessibility-tool-audit";

scraper.scrape(`${site}/test-cases.html`).then(async page => {
  await remove(`docs/examples/scrape-and-check/result`);

  for (const { id, url } of await getUrls(page.document)) {
    notify({ message: "Auditing", value: url });

    const page = await scraper.scrape(`${site}/${url}`);

    const results = audit(page, Rules).map(result => {
      if ("target" in result) {
        return { ...result, target: serialize(result.target) };
      }

      return result;
    });

    await write(
      `docs/examples/scrape-and-check/result/${id}.json`,
      JSON.stringify(results, null, 2)
    );

    notify({ message: "Audit complete", type: "success" });
  }

  await scraper.close();
});

async function getUrls(
  document: Document
): Promise<Array<Readonly<{ id: string; url: string }>>> {
  return findAll(document, document, "h3[id]").map(header => {
    const example = getNextElementSibling(header, document);
    const id = getAttribute(header, "id")!;

    if (example !== null) {
      const anchor = find(example, document, "a[href^='example-pages/']");

      if (anchor !== null) {
        return { id, url: getAttribute(anchor, "href")! };
      }
    }

    const anchor = find(header, document, "a")!;

    return { id, url: getAttribute(anchor, "href")! };
  });
}
