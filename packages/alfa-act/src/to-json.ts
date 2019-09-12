import { Seq } from "@siteimprove/alfa-collection";
import {
  getChildNodes,
  getOwnerElement,
  getParentNode,
  getTagName,
  isAttribute,
  isDocument,
  isElement,
  Node,
  serialize
} from "@siteimprove/alfa-dom";
import * as JSON from "@siteimprove/alfa-json-ld";
import { expand, List } from "@siteimprove/alfa-json-ld";
import { Contexts } from "./contexts";
import { isTargetGroup, isTargetUnit } from "./guards";
import { Aspect, AspectsFor, Outcome, Result, Rule, Target } from "./types";

const { assign } = Object;

// The `toJson()` function is special in that it requires use of conditional
// types in order to correctly infer the union of aspect and target types for a
// list of rules. In order to do so, we unfortunately have to make use of the
// `any` type, which trips up TSLint as we've made the `any` type forbidden and
// this for good reason.

// tslint:disable-next-line:no-any
type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? A
  : never;

// tslint:disable-next-line:no-any
type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? T
  : never;

export function toJSON<
  R extends Rule<any, any>, // tslint:disable-line:no-any
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(results: Iterable<Result<A, T>>, aspects: AspectsFor<A>): List {
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

  for (const [rule, group] of Seq(results).groupBy(result => result.rule)) {
    for (const result of group.toList()) {
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
        test: [{ "@id": rule.id, "@type": "earl:TestCase" }],
        result: testCaseResult
      });
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
      if (isTargetUnit(target)) {
        return {
          pointer: {
            "@context": Contexts.XPathPointer,
            "@type": ["ptr:Pointer", "ptr:XPathPointer"],
            expression: getPath(target, aspects.document!)
          }
        };
      }

      if (isTargetGroup(target)) {
        const pointers: Array<JSON.Document> = [];

        for (const subtarget of target) {
          const pointer = getPointer(aspects, aspect, subtarget);

          if (pointer !== null) {
            pointers.push(pointer);
          }
        }

        return {
          pointer: {
            "@context": Contexts.RelatedPointers,
            "@type": ["ptr:Pointer", "ptr:RelatedPointers"],
            pointers
          }
        };
      }
  }

  return null;
}

function getPath(node: Node, context: Node): string {
  if (isAttribute(node)) {
    const owner = getOwnerElement(node, context);

    if (owner !== null) {
      let qualifiedName: string;

      if (node.prefix === null) {
        qualifiedName = node.localName;
      } else {
        qualifiedName = `${node.prefix}:${node.localName}`;
      }

      return `${getPath(owner, context)}/@${qualifiedName}`;
    }
  } else {
    if (isElement(node)) {
      const parentNode = getParentNode(node, context, {
        flattened: true
      });

      const tagName = getTagName(node, context);

      if (parentNode !== null) {
        const childNodes = [
          ...getChildNodes(parentNode, context, {
            flattened: true
          })
        ];

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
  }

  return "";
}
