import { Rule, Outcome, Oracle } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Request, Response } from "@siteimprove/alfa-http";
import { None } from "@siteimprove/alfa-option";
import { URL } from "@siteimprove/alfa-url";
import { Page } from "@siteimprove/alfa-web";

// Creating these once allow to actually trigger caches in rules that rely on them.
const defaultRequest = Request.of("GET", URL.example());
const defaultResponse = Response.of(URL.example(), 200);
const defaultDocument = Document.empty();
const defaultDevice = Device.standard();

export function evaluate<T extends Hashable, Q, S>(
  rule: Rule<Page, T, Q, S>,
  page: Partial<Page>,
  oracle: Oracle<Page, T, Q, S> = () => Future.now(None)
): Future<Array<Outcome.JSON>> {
  const {
    request = defaultRequest,
    response = defaultResponse,
    document = defaultDocument,
    device = defaultDevice,
  } = page;

  return rule
    .evaluate(Page.of(request, response, document, device), oracle)
    .map((outcomes) => [...outcomes].map((outcome) => outcome.toJSON()));
}
