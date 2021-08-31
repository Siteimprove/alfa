import { Rule, Outcome } from "@siteimprove/alfa-act-base";
import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Request, Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-url";
import { Page } from "@siteimprove/alfa-web";

export function evaluate<T, Q, S>(
  rule: Rule<Page, T, Q, S>,
  page: Partial<Page>
): Future<Array<Outcome.JSON>> {
  const {
    request = Request.of("GET", URL.example()),
    response = Response.of(URL.example(), 200),
    document = Document.empty(),
    device = Device.standard(),
  } = page;

  return rule
    .evaluate(Page.of(request, response, document, device))
    .map((outcomes) => [...outcomes].map((outcome) => outcome.toJSON()));
}
