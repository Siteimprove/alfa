import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";
import { Decoder } from "@siteimprove/alfa-encoding";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Page } from "@siteimprove/alfa-web";

const { stringify } = JSON;

export default function <Q>(): Formatter<Page, Node | Iterable<Node>, Q> {
  return function SARIF(page, outcomes) {
    outcomes = [...outcomes];

    const rules = [
      ...[...outcomes].reduce(
        (rules, outcome) => rules.add(outcome.rule),
        new Set<Rule<Page, Node | Iterable<Node>, Q>>()
      ),
    ];

    const artifacts = [
      {
        location: {
          uri: page.response.url,
        },
        contents: {
          text: Decoder.decode(new Uint8Array(page.response.body)),
        },
      },
    ];

    const results = [...outcomes].map((outcome) => {
      let kind = "notApplicable";
      let level = "none";
      let locations: Array<unknown> = [];
      let message = "This rule did not apply to the test subject";

      if (Outcome.isPassed(outcome)) {
        kind = "pass";
      }

      if (Outcome.isFailed(outcome)) {
        kind = "fail";
        level = "error";
      }

      if (Outcome.isCantTell(outcome)) {
        kind = "review";
        level = "warning";
        message =
          "This rule has outstanding questions that must be answered for the test target";
      }

      if (Outcome.isPassed(outcome) || Outcome.isFailed(outcome)) {
        message = outcome.expectations
          .toArray()
          .map(([id, expectation]) => {
            return `${id}. ${expectation
              .map((result) => (result.isOk() ? result.get() : result.getErr()))
              .get()}`;
          })
          .join("\n");
      }

      if (Outcome.isApplicable(outcome)) {
        let targets: Array<Node> = [];

        if (Node.isNode(outcome.target)) {
          targets = [outcome.target];
        } else {
          targets = [...outcome.target];
        }

        for (const target of targets) {
          locations.push({
            physicalLocation: {
              artifactLocation: {
                index: 0,
              },
              region: {
                snippet: {
                  text: target.toString(),
                },
              },
            },
            logicalLocations: [
              {
                fullyQualifiedName: target.path(),
              },
            ],
          });
        }
      }

      return {
        ruleId: outcome.rule.uri,
        ruleIndex: rules.indexOf(outcome.rule),
        kind,
        level,
        message: {
          text: message,
          markdown: message,
        },
        locations,
      };
    });

    return stringify(
      {
        version: "2.1.0",
        $schema: "https://json.schemastore.org/sarif-2.1.0-rtm.5.json",
        runs: [
          {
            tool: {
              driver: {
                name: "Alfa",
                rules: rules.map((rule) => {
                  return {
                    id: rule.uri,
                    helpUri: rule.uri,
                  };
                }),
              },
            },
            results,
            artifacts,
          },
        ],
      },
      null,
      2
    );
  };
}
