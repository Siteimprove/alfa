import {
  Attribute,
  getOwnerElement,
  getParentNode,
  getTagName,
  isDocument,
  isElement,
  Node,
  serialize
} from "@siteimprove/alfa-dom";
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

type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? A
  : never;

type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? T
  : never;

export function toJson<
  R extends Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(rules: Array<R>, results: Array<Result<A, T>>, aspects: AspectsFor<A>): List {
  let request: JSON.Document | null = null;

  if (aspects.request !== undefined) {
    const { request: aspect } = aspects;

    request = {
      "@context": Contexts.Request,
      "@id": getNodeId(),
      "@type": ["earl:TestSubject", "http:Request"],

      methodName: aspect.method,
      requestURI: aspect.url
    };
  }

  let response: JSON.Document | null = null;

  if (aspects.response !== undefined) {
    const { response: aspect } = aspects;

    response = {
      "@context": Contexts.Response,
      "@id": getNodeId(),
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

  if (aspects.document !== undefined) {
    const { document: aspect } = aspects;

    document = {
      "@context": Contexts.Content,
      "@id": getNodeId(),
      "@type": ["earl:TestSubject", "cnt:ContentAsText"],

      characterEncoding: "UTF-8",
      chars: serialize(aspect, aspect, { flattened: true })
    };
  }

  const subject: JSON.Document = {
    "@context": Contexts.Subject,
    "@id": request === null ? getNodeId() : request.requestURI,
    "@type": "earl:TestSubject",
    parts: [request, response, document]
  };

  const assertor: JSON.Document = {
    "@context": Contexts.Assertor,
    "@id": "https://github.com/siteimprove/alfa",
    "@type": ["earl:Assertor", "earl:Software", "doap:Project"],
    name: "Alfa",
    vendor: {
      "@id": "https://siteimprove.com/",
      "@type": "foaf:Organization",
      "foaf:name": "Siteimprove A/S"
    }
  };

  const assertion: JSON.Document = {
    "@context": Contexts.Assertion,
    "@type": "earl:Assertion",
    assertedBy: {
      "@id": assertor["@id"]
    },
    subject: {
      "@id": subject["@id"]
    }
  };

  const assertions: Array<JSON.Document> = [];

  for (const [ruleId, group] of groupBy(results, result => result.rule)) {
    const { requirements = [] } = rules.find(rule => rule.id === ruleId)!;

    for (const result of group) {
      const testCaseResult = {
        "@context": Contexts.Result,
        "@type": "earl:TestResult",
        outcome: {
          "@id": `earl:${result.outcome}`
        },
        pointer: null
      };

      if (result.outcome !== Outcome.Inapplicable) {
        const pointer = getPointer(aspects, result.aspect, result.target);

        if (pointer !== null) {
          switch (result.aspect) {
            case aspects.document:
              assign(pointer.pointer, {
                reference: { "@id": document!["@id"] }
              });
          }

          assign(testCaseResult, pointer);
        }
      }

      assertions.push({
        ...assertion,
        test: [{ "@id": ruleId, "@type": "earl:TestCase" }],
        result: testCaseResult
      });

      for (const requirement of requirements) {
        const outcome =
          result.outcome === Outcome.Passed && requirement.partial === true
            ? Outcome.CantTell
            : result.outcome;

        assertions.push({
          ...assertion,
          test: [{ "@id": requirement.id, "@type": "earl:TestRequirement" }],
          result: {
            ...testCaseResult,
            outcome: {
              "@id": `earl:${outcome}`
            }
          }
        });
      }
    }
  }

  return expand([subject, assertor, ...assertions]);
}

function getNodeId(): string {
  return `_:${Math.random()
    .toString(36)
    .substr(2, 5)}`;
}

function getPointer<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  aspect: A,
  target: T
): JSON.Document | null {
  switch (aspect) {
    case aspects.document:
      return {
        pointer: {
          "@context": Contexts.XPathPointer,
          "@type": ["ptr:Pointer", "ptr:XPathPointer"],
          expression: getPath(target, aspects.document!)
        }
      };
  }

  return null;
}

function getPath(target: Node | Attribute, context: Node): string {
  if ("nodeType" in target) {
    const node = target;

    if (isElement(node)) {
      const parentNode = getParentNode(node, context, { flattened: true });
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
