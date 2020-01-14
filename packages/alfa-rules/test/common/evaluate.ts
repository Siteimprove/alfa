import { Rule, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

export function evaluate<T, Q>(
  rule: Rule<Page, T, Q>,
  page: Partial<Page>
): Future<Array<Outcome<Page, T, Q>>> {
  const {
    request = Request.empty(),
    response = Response.empty(),
    document = Document.empty(),
    device = Device.standard()
  } = page;

  return rule
    .evaluate(Page.of(request, response, document, device))
    .map(outcomes => [...outcomes]);
}
