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
      let message = "The rule did not apply to the test subject";

      if (Outcome.isPassed(outcome)) {
        kind = "pass";
        message = "The test target passes all requirements:\n\n";
        message += outcome.expectations
          .toArray()
          .map(([, expectation]) => {
            return `- ${expectation.map((result) => result.get()).get()}`;
          })
          .join("\n");
      }

      if (Outcome.isFailed(outcome)) {
        kind = "fail";
        level = "error";
        message = "The test target fails the following requirements:\n\n";
        message += outcome.expectations
          .toArray()
          .filter(([, expectation]) => expectation.get().isErr())
          .map(([, expectation]) => {
            return `- ${expectation.map((result) => result.getErr()).get()}`;
          })
          .join("\n");
      }

      if (Outcome.isCantTell(outcome)) {
        kind = "review";
        level = "warning";
        message =
          "The rule has outstanding questions that must be answered for the test target";
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
        $schema: "https://json.schemastore.org/sarif-2.1.0-rtm.5.json",
        version: "2.1.0",
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
