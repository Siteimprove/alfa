import { Rule, Outcome, Oracle } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Request, Response } from "@siteimprove/alfa-http";
import { None } from "@siteimprove/alfa-option";
import { URL } from "@siteimprove/alfa-url";
import { Page } from "@siteimprove/alfa-web";

export function evaluate<T, Q, S>(
  rule: Rule<Page, T, Q, S>,
  page: Partial<Page>,
  oracle: Oracle<Page, T, Q, S> = () => Future.now(None)
): Future<Array<Outcome.JSON>> {
  const {
    request = Request.of("GET", URL.example()),
    response = Response.of(URL.example(), 200),
    document = Document.empty(),
    device = Device.standard(),
  } = page;

  return rule
    .evaluate(Page.of(request, response, document, device), oracle)
    .map((outcomes) => [...outcomes].map((outcome) => outcome.toJSON()));
}
