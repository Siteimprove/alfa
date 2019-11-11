import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Outcome } from "@siteimprove/alfa-act";
import { Record } from "@siteimprove/alfa-record";
import { Page } from "@siteimprove/alfa-web";

import rule from "../../src/sia-r1/rule";

test("evaluate() passes when a document has a title", t => {
  const page = Page.of({
    document: {
      nodeType: 9,
      styleSheets: [],
      childNodes: [
        <html>
          <head>
            <title>Hello world</title>
          </head>
        </html>
      ]
    }
  });

  t.deepEqual(
    [...rule.evaluate(page)],
    [
      Outcome.Passed.of(
        rule,
        page.document,
        Record.from([
          [
            "1",
            {
              holds: true
            }
          ],
          [
            "2",
            {
              holds: true
            }
          ]
        ])
      )
    ]
  );
});

// test("Fails when document has no title", t => {
//   const document = documentFromNodes([
//     <html>
//       <head />
//     </html>
//   ]);

//   outcome(t, SIA_R1, { document }, { failed: [document] });
// });

// test("Fails when only other namespace has a title", t => {
//   const document = documentFromNodes([
//     <html>
//       <head>
//         <svg>
//           <title>Hello World</title>
//         </svg>
//       </head>
//     </html>
//   ]);

//   outcome(t, SIA_R1, { document }, { failed: [document] });
// });

// test("Only applies to the HTML namespace", t => {
//   const document = documentFromNodes([
//     <svg>
//       <title>Hello World</title>
//     </svg>
//   ]);

//   outcome(t, SIA_R1, { document }, Outcome.Inapplicable);
// });
