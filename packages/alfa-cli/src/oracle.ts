import * as enquirer from "enquirer";

import { Cache } from "@siteimprove/alfa-cache";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import { Question } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";

import * as act from "@siteimprove/alfa-act";
import * as xpath from "@siteimprove/alfa-xpath";

export const Oracle = (page: Page): act.Oracle<Question> => {
  const answers = Cache.empty<unknown, Cache<string, Future<any>>>();

  return (_, question) => {
    return answers.get(question.subject, Cache.empty).get(question.uri, () => {
      process.stdout.write(`\n${question.subject}\n\n`);

      if (question.type === "boolean") {
        return Future.from(
          enquirer
            .prompt<{ [key: string]: boolean }>({
              name: question.uri,
              type: "toggle",
              message: question.message,
            })
            .then((answer) => Option.of(question.answer(answer[question.uri])))
            .catch(() => None)
        );
      }

      if (question.type === "node") {
        return Future.from(
          enquirer
            .prompt<{ [key: string]: string }>({
              name: question.uri,
              type: "input",
              message: question.message,
              validate: (expression) => {
                if (expression === "") {
                  return true;
                }

                const nodes = [
                  ...xpath.evaluate(page.document, expression, {
                    composed: true,
                    nested: true,
                  }),
                ];

                if (nodes.length === 1) {
                  return true;
                }

                return "Invalid XPath expression";
              },
            })
            .then((answer) => {
              const expression = answer[question.uri];

              const node = Iterable.first(
                xpath.evaluate(page.document, expression, {
                  composed: true,
                  nested: true,
                })
              );

              return Option.of(question.answer(node));
            })
            .catch(() => None)
        );
      }

      return Future.now(None);
    });
  };
};
