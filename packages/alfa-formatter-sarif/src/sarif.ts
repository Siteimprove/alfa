import { Serializable, Log } from "@siteimprove/alfa-sarif";
import { Formatter } from "@siteimprove/alfa-formatter";

const { stringify } = JSON;

/**
 * @public
 */
export default function <I, T, Q>(): Formatter<I, T, Q> {
  return function SARIF(input, rules, outcomes) {
    const log: Log = {
      $schema: "https://json.schemastore.org/sarif-2.1.0-rtm.5.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "Alfa",
              rules: [...rules].map((rule) => rule.toSARIF()),
            },
          },
          artifacts: [...Serializable.toSARIF(input)],
          results: [...outcomes].map((outcome) => outcome.toSARIF()),
        },
      ],
    };

    return stringify(log, null, 2);
  };
}
