import {
  render,
  parse,
  Node,
  Heading,
  Text,
  Paragraph,
  Blockquote,
  Table
} from "@siteimprove/alfa-markdown";
import { Rule, Target, Aspect, Outcome, Locale } from "./types";

const { keys } = Object;

export function markdown<T extends Target, A extends Aspect, C = null>(
  rule: Rule<T, A, C>,
  lang: Locale["id"]
): string | null {
  const locale = rule.locales.find(locale => locale.id === lang);

  if (!locale) {
    return null;
  }

  const nodes: Array<Node> = [
    {
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: locale.title } as Text]
    } as Heading,
    {
      type: "blockquote",
      children: [{ type: "text", value: rule.id } as Text]
    } as Blockquote,

    {
      type: "heading",
      depth: 2,
      children: [{ type: "text", value: "Applicability " } as Text]
    } as Heading,
    {
      type: "paragraph",
      children: parse(locale.applicability).children
    } as Paragraph,

    {
      type: "heading",
      depth: 2,
      children: [{ type: "text", value: "Expectations" } as Text]
    } as Heading
  ];

  let index = 1;

  for (const key of keys(locale.expectations)) {
    const expectation = locale.expectations[key];

    nodes.push(
      {
        type: "heading",
        depth: 3,
        children: [{ type: "text", value: `Expectation ${index++}` } as Text]
      } as Heading,
      {
        type: "paragraph",
        children: parse(expectation.description).children
      } as Paragraph,
      {
        type: "heading",
        depth: 4,
        children: [{ type: "text", value: "Result" } as Text]
      } as Heading
    );

    const result: Table = {
      type: "table",
      align: [],
      children: [
        {
          type: "tableRow",
          children: [
            {
              type: "tableCell",
              children: [{ type: "text", value: "Outcome" } as Text]
            },
            {
              type: "tableCell",
              children: [{ type: "text", value: "Description" } as Text]
            }
          ]
        }
      ]
    };

    for (const outcome of ["passed", "failed"]) {
      const description = expectation.outcome[outcome as Outcome];

      if (description) {
        result.children.push({
          type: "tableRow",
          children: [
            {
              type: "tableCell",
              children: [{ type: "text", value: outcome } as Text]
            },
            {
              type: "tableCell",
              children: parse(description).children
            }
          ]
        });
      }
    }

    nodes.push(result);
  }

  return render({ type: "root", children: nodes });
}
