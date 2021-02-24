/// <reference lib="dom" />
import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";

import { Media } from "../src";
import { Feature } from "../src/feature";

function parse(input: string) {
  return Media.parse(Lexer.lex(input)).map(([, query]) => query.toJSON());
}

// test(".parse() parses a simple query", (t) => {
//   t.deepEqual(parse("(orientation: portrait)").get(), [
//     {
//       type: "query",
//       modifier: null,
//       mediaType: null,
//       condition: {
//         type: "feature",
//         name: "orientation",
//         value: {
//           type: "discrete",
//           value: {
//             type: "string",
//             value: "portrait",
//           },
//         },
//       },
//     },
//   ]);
// });
//
// test(".parse() parses a list of queries", (t) => {
//   t.deepEqual(
//     parse(
//       "screen, (orientation: landscape) and ((max-width: 640px) or (not (min-height: 100px)))"
//     ).get(),
//     [
//       {
//         type: "query",
//         modifier: null,
//         mediaType: {
//           type: "type",
//           name: "screen",
//         },
//         condition: null,
//       },
//       {
//         type: "query",
//         modifier: null,
//         mediaType: null,
//         condition: {
//           type: "expression",
//           combinator: "and",
//           left: {
//             type: "feature",
//             name: "orientation",
//             value: {
//               type: "discrete",
//               value: {
//                 type: "string",
//                 value: "landscape",
//               },
//             },
//           },
//           right: {
//             type: "expression",
//             combinator: "or",
//             left: {
//               type: "feature",
//               name: "width",
//               value: {
//                 type: "range",
//                 minimum: null,
//                 maximum: {
//                   value: {
//                     type: "length",
//                     value: 640,
//                     unit: "px",
//                   },
//                   isInclusive: true,
//                 },
//               },
//             },
//             right: {
//               type: "negation",
//               condition: {
//                 type: "feature",
//                 name: "height",
//                 value: {
//                   type: "range",
//                   minimum: {
//                     value: {
//                       type: "length",
//                       value: 100,
//                       unit: "px",
//                     },
//                     isInclusive: true,
//                   },
//                   maximum: null,
//                 },
//               },
//             },
//           },
//         },
//       },
//     ]
//   );
// });
//
// test(".parse() parses a list of mixed type and feature queries", (t) => {
//   t.deepEqual(
//     parse("screen and (orientation: portrait) and (min-width: 100px)").get(),
//     [
//       {
//         type: "query",
//         modifier: null,
//         mediaType: {
//           type: "type",
//           name: "screen",
//         },
//         condition: {
//           type: "expression",
//           combinator: "and",
//           left: {
//             type: "feature",
//             name: "orientation",
//             value: {
//               type: "discrete",
//               value: {
//                 type: "string",
//                 value: "portrait",
//               },
//             },
//           },
//           right: {
//             type: "feature",
//             name: "width",
//             value: {
//               type: "range",
//               minimum: {
//                 value: {
//                   type: "length",
//                   value: 100,
//                   unit: "px",
//                 },
//                 isInclusive: true,
//               },
//               maximum: null,
//             },
//           },
//         },
//       },
//     ]
//   );
// });
//
// test(".parse() does not create a modifier in the absence of a type", (t) => {
//   t.deepEqual(parse("not screen and (orientation: landscape)").get(), [
//     {
//       type: "query",
//       modifier: "not",
//       mediaType: {
//         type: "type",
//         name: "screen",
//       },
//       condition: {
//         type: "feature",
//         name: "orientation",
//         value: {
//           type: "discrete",
//           value: {
//             type: "string",
//             value: "landscape",
//           },
//         },
//       },
//     },
//   ]);
//
//   t.deepEqual(parse("not (orientation: landscape)").get(), [
//     {
//       type: "query",
//       modifier: null,
//       mediaType: null,
//       condition: {
//         type: "negation",
//         condition: {
//           type: "feature",
//           name: "orientation",
//           value: {
//             type: "discrete",
//             value: {
//               type: "string",
//               value: "landscape",
//             },
//           },
//         },
//       },
//     },
//   ]);
// });
//
// test(".parse() return 'not all' for syntactically incorrect queries", (t) => {
//   // wiping out the ful query, but keeping the rest of the query list.
//   const result: Media.List.JSON = [
//     {
//       type: "query",
//       modifier: "not",
//       mediaType: { type: "type", name: "all" },
//       condition: null,
//     },
//     {
//       type: "query",
//       modifier: null,
//       mediaType: { type: "type", name: "screen" },
//       condition: null,
//     },
//   ];
//
//   // "or" after a media type"
//   t.deepEqual(parse("screen or (min-width: 100px), screen").get(), result);
//
//   // mixing combinators
//   t.deepEqual(
//     parse(
//       "(orientation: portrait) and (scripting: none) or (min-width: 100px), screen"
//     ).get(),
//     result
//   );
//
//   // invalid token in parenthesis
//   t.deepEqual(parse("(example, all, ), screen").get(), result);
//
//   // forbidden media-type keyword
//   t.deepEqual(parse("or and (orientation), screen").get(), result);
//
//   // unknown mf-name
//   t.deepEqual(parse("(unknown), screen").get(), result);
//   t.deepEqual(
//     parse("(max-weight: 3px) or (orientation), screen").get(),
//     result
//   );
//
//   // invalid min-/max- prefix
//   t.deepEqual(parse("(min-orientation: portrait), screen").get(), result);
//
//   // unknown mf-value
//   t.deepEqual(parse("(max-width: 3km), screen").get(), result);
//
//   // disallowed mf-value
//   t.deepEqual(parse("(orientation: 2px), screen").get(), result);
//   t.deepEqual(parse("(orientation: south), screen").get(), result);
//   t.deepEqual(parse("(width: portrait), screen").get(), result);
// });
//
// test(".parse() accepts unknown media types", (t) => {
//   t.deepEqual(parse("unknown").get(), [
//     {
//       type: "query",
//       modifier: null,
//       mediaType: { type: "type", name: "unknown" },
//       condition: null,
//     },
//   ]);
// });

test(".parse() parses ranges", (t) => {
  // t.deepEqual(parse("(100px < width)").get(), [
  //   {
  //     type: "query",
  //     modifier: null,
  //     mediaType: null,
  //     condition: {
  //       type: "feature",
  //       name: "width",
  //       value: {
  //         type: "range",
  //         minimum: {
  //           value: {
  //             type: "length",
  //             value: 100,
  //             unit: "px",
  //           },
  //           isInclusive: false,
  //         },
  //         maximum: null,
  //       },
  //     },
  //   },
  // ]);

  // const foo = Lexer.lex("width > 100px");
  //
  // console.dir(Feature.parseRange(foo).toJSON(), { depth: null });

  t.deepEqual(parse("(width > 100px)").get(), [
    {
      type: "query",
      modifier: null,
      mediaType: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 100,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);

  t.deepEqual(parse("(100px < width <= 500px)").get(), [
    {
      type: "query",
      modifier: null,
      mediaType: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 100,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: {
            value: {
              type: "length",
              value: 500,
              unit: "px",
            },
            isInclusive: true,
          },
        },
      },
    },
  ]);
});
