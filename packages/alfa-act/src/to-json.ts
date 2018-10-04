import { serialize } from "@siteimprove/alfa-dom";
import { Document, expand, List } from "@siteimprove/alfa-json-ld";
import { groupBy } from "@siteimprove/alfa-util";
import { Contexts } from "./contexts";
import { Aspect, Aspects, Result, Target } from "./types";

export function toJson<A extends Aspect, T extends Target>(
  results: Array<Result<A, T>>,
  aspects: Aspects
): List {
  const request: Document = {
    "@context": Contexts.Request,
    "@id": "_:request",
    "@type": ["earl:TestSubject", "http:Request"],

    methodName: aspects.request.method,
    requestURI: aspects.request.url
  };

  const body: Document = {
    "@context": Contexts.Content,

    characterEncoding: "UTF-8",
    chars: aspects.response.body
  };

  const response: Document = {
    "@context": Contexts.Response,
    "@id": "_:response",
    "@type": ["earl:TestSubject", "http:Response"],

    body,
    statusCodeValue: aspects.response.status
  };

  const document: Document = {
    "@context": Contexts.Content,
    "@id": "_:document",
    "@type": ["earl:TestSubject", "cnt:ContentAsText"],

    characterEncoding: "UTF-8",
    chars: serialize(aspects.document, aspects.document, { flattened: true })
  };

  const assertions: Array<Document> = [];

  for (const [rule, group] of groupBy(results, result => result.rule)) {
    const requirements =
      rule.requirements === undefined
        ? []
        : rule.requirements.map(requirement => ({
            "@id": requirement,
            "@type": "earl:TestRequirement"
          }));

    const result = group.map(result => ({
      "@context": Contexts.Result,
      outcome: { "@id": `earl:${result.outcome}` }
    }));

    assertions.push({
      "@context": Contexts.Assertion,
      assertedBy: {
        "@id": "https://github.com/siteimprove/alfa",
        "@type": "earl:Software"
      },
      subject: [
        { "@id": "_:request" },
        { "@id": "_:response" },
        { "@id": "_:document" }
      ],
      test: [
        {
          "@id": rule.id,
          "@type": "earl:TestCase"
        },
        ...requirements
      ],
      result
    });
  }

  return expand([request, response, document, ...assertions]);
}
