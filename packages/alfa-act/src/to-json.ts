import {
  Attribute,
  Document,
  getOwnerElement,
  getParentNode,
  getTagName,
  isDocument,
  isElement,
  Node,
  serialize
} from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import * as JSON from "@siteimprove/alfa-json-ld";
import { expand, List } from "@siteimprove/alfa-json-ld";
import { groupBy } from "@siteimprove/alfa-util";
import { Contexts } from "./contexts";
import { Aspect, AspectsFor, Outcome, Result, Rule, Target } from "./types";

// The `toJson()` function is special in that it requires use of conditional
// types in order to correctly infer the union of aspect and target types for a
// list of rules. In order to do so, we unfortunately have to make use of the
// `any` type, which trips up TSLint as we've made the `any` type forbidden and
// this for good reason.
//
// tslint:disable:no-any

const { assign } = Object;

type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T> ? A : never;

type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T> ? T : never;

export function toJson<R extends Rule<any, any>, A extends AspectsOf<R> = AspectsOf<R>, T extends TargetsOf<R> = TargetsOf<R>>(
  rules: Array<R>,
  results: Array<Result<T>>,
  aspects: AspectsFor<A>
): List {
  let request: JSON.Document | null = null;

  if ("request" in aspects) {
    const { request: aspect } = aspects as AspectsFor<Request>;

    request = {
      "@context": Contexts.Request,
      "@id": "_:request",
      "@type": ["earl:TestSubject", "http:Request"],

      methodName: aspect.method,
      requestURI: aspect.url
    };
  }

  let response: JSON.Document | null = null;

  if ("response" in aspects) {
    const { response: aspect } = aspects as AspectsFor<Response>;

    response = {
      "@context": Contexts.Response,
      "@id": "_:response",
      "@type": ["earl:TestSubject", "http:Response"],

      body: {
        "@context": Contexts.Content,
        "@type": "cnt:ContentAsText",

        characterEncoding: "UTF-8",
        chars: aspect.body
      },
      statusCodeValue: aspect.status
    };
  }

  let document: JSON.Document | null = null;

  if ("document" in aspects) {
    const { document: aspect } = aspects as AspectsFor<Document>;

    document = {
      "@context": Contexts.Content,
      "@id": "_:document",
      "@type": ["earl:TestSubject", "cnt:ContentAsText"],

      characterEncoding: "UTF-8",
      chars: serialize(aspect, aspect, { flattened: true })
    };
  }

  const assertion: JSON.Document = {
    "@context": Contexts.Assertion,
    "@type": "earl:Assertion",
    assertedBy: {
      "@id": "https://github.com/siteimprove/alfa",
      "@type": "earl:Software"
    },
    subject: [
      { "@id": "_:request" },
      { "@id": "_:response" },
      { "@id": "_:document" }
    ]
  };

  const assertions: Array<JSON.Document> = [];

  for (const [ruleId, group] of groupBy(results, result => result.rule)) {
    assertions.push({
      ...assertion,
      test: [
        {
          "@id": ruleId,
          "@type": "earl:TestCase"
        }
      ],
      result: group.map(result => {
        const mapped = {
          "@context": Contexts.Result,
          "@type": "earl:TestResult",
          outcome: {
            "@id": `earl:${result.outcome}`
          }
        };

        if (result.outcome !== Outcome.Inapplicable) {
          assign(mapped, getPointer(aspects, result.target));
        }

        return mapped;
      })
    });

    const { requirements } = rules.find(rule => rule.id === ruleId)!;

    for (const requirement of requirements === undefined ? [] : requirements) {
      assertions.push({
        ...assertion,
        test: [
          {
            "@id": requirement.id,
            "@type": "earl:TestRequirement"
          }
        ],
        result: group.map(result => {
          const outcome =
            result.outcome === Outcome.Passed && requirement.partial === true
              ? Outcome.CantTell
              : result.outcome;

          const mapped = {
            "@context": Contexts.Result,
            "@type": "earl:TestResult",
            outcome: {
              "@id": `earl:${outcome}`
            }
          };

          if (result.outcome !== Outcome.Inapplicable) {
            assign(mapped, getPointer(aspects, result.target));
          }

          return mapped;
        })
      });
    }
  }

  return expand([request, response, document, ...assertions]);
}

function getPointer<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  target: T
): JSON.Document | null {
  if ("document" in aspects) {
    const { document } = aspects as AspectsFor<Document>;

    return {
      pointer: {
        "@context": Contexts.XPathPointer,
        "@type": ["ptr:Pointer", "ptr:XPathPointer"],
        reference: { "@id": "_:document" },
        expression: getPath(target, document)
      }
    };
  }

  return null;
}

function getPath(target: Node | Attribute, context: Node): string {
  if ("nodeType" in target) {
    const node = target;

    if (isElement(node)) {
      const parentNode = getParentNode(node, context);
      const tagName = getTagName(node, context);

      if (parentNode !== null) {
        const { childNodes } = parentNode;

        for (let i = 0, j = 1, n = childNodes.length; i < n; i++) {
          const childNode = childNodes[i];

          if (childNode === node) {
            return `${getPath(parentNode, context)}/${tagName}[${j}]`;
          }

          if (
            isElement(childNode) &&
            getTagName(childNode, context) === tagName
          ) {
            j++;
          }
        }
      }
    }

    if (isDocument(node)) {
      return "/";
    }
  } else {
    const attribute = target;
    const owner = getOwnerElement(attribute, context);

    if (owner !== null) {
      let qualifiedName: string;

      if (attribute.prefix === null) {
        qualifiedName = attribute.localName;
      } else {
        qualifiedName = `${attribute.prefix}:${attribute.localName}`;
      }

      return `${getPath(owner, context)}/@${qualifiedName}`;
    }
  }

  return "";
}
