export default {
  nestedGroups: () => [
    {
      name: "Accessibility Conformance Testing",
      children: [
        "@siteimprove/alfa-act",
        "@siteimprove/alfa-wcag",
        {
          name: "Formatter",
          children: [
            "@siteimprove/alfa-formatter",
            "@siteimprove/alfa-formatter-earl",
            "@siteimprove/alfa-formatter-json",
            "@siteimprove/alfa-formatter-sarif",
          ],
        },
      ],
    },
    {
      name: "Data types",
      children: [
        {
          name: "Alternatives",
          children: [
            "@siteimprove/alfa-either",
            "@siteimprove/alfa-option",
            "@siteimprove/alfa-result",
            "@siteimprove/alfa-selective",
          ],
        },
        {
          name: "Collections",
          children: [
            {
              name: "Built ins",
              children: [
                "@siteimprove/alfa-array",
                "@siteimprove/alfa-iterable",
              ],
            },
            "@siteimprove/alfa-bits",
            "@siteimprove/alfa-branched",
            "@siteimprove/alfa-collection",
            "@siteimprove/alfa-flags",
            "@siteimprove/alfa-list",
            "@siteimprove/alfa-map",
            "@siteimprove/alfa-record",
            "@siteimprove/alfa-sequence",
            "@siteimprove/alfa-set",
            "@siteimprove/alfa-slice",
            "@siteimprove/alfa-tree",
            "@siteimprove/alfa-tuple",
          ],
        },
        {
          name: "Comparison",
          children: [
            "@siteimprove/alfa-comparable",
            "@siteimprove/alfa-equatable",
          ],
        },
        {
          name: "Computations",
          children: [
            {
              name: "Asynchronous",
              children: [
                "@siteimprove/alfa-future",
                "@siteimprove/alfa-promise",
                "@siteimprove/alfa-thenable",
              ],
            },
            {
              name: "Synchronous",
              children: [
                "@siteimprove/alfa-lazy",
                "@siteimprove/alfa-trampoline",
              ],
            },
          ],
        },
        {
          name: "Graphs",
          children: ["@siteimprove/alfa-graph", "@siteimprove/alfa-network"],
        },
        {
          name: "Hash tables",
          children: [
            "@siteimprove/alfa-encoding",
            "@siteimprove/alfa-fnv",
            "@siteimprove/alfa-hash",
          ],
        },
        {
          name: "Logic",
          children: [
            "@siteimprove/alfa-predicate",
            "@siteimprove/alfa-refinement",
            "@siteimprove/alfa-trilean",
          ],
        },
        {
          name: "Performance measurements",
          children: [
            "@siteimprove/alfa-emitter",
            "@siteimprove/alfa-performance",
          ],
        },
        {
          name: "Serialization",
          children: [
            "@siteimprove/alfa-earl",
            "@siteimprove/alfa-json",
            "@siteimprove/alfa-json-ld",
            "@siteimprove/alfa-sarif",
          ],
        },
        {
          name: "Type definitions",
          children: [
            "@siteimprove/alfa-applicative",
            "@siteimprove/alfa-callback",
            "@siteimprove/alfa-clone",
            "@siteimprove/alfa-continuation",
            "@siteimprove/alfa-foldable",
            "@siteimprove/alfa-functor",
            "@siteimprove/alfa-generator",
            "@siteimprove/alfa-mapper",
            "@siteimprove/alfa-monad",
            "@siteimprove/alfa-reducer",
            "@siteimprove/alfa-thunk",
          ],
        },
        "@siteimprove/alfa-affine",
        "@siteimprove/alfa-cache",
        "@siteimprove/alfa-highlight",
        "@siteimprove/alfa-math",
        "@siteimprove/alfa-parser",
        "@siteimprove/alfa-test",
        "@siteimprove/alfa-time",
      ],
    },
    {
      name: "Integrations with frameworks",
      children: [
        {
          name: "Test frameworks",
          children: [
            "@siteimprove/alfa-assert",
            "@siteimprove/alfa-chai",
            "@siteimprove/alfa-cypress",
            "@siteimprove/alfa-jasmine",
            "@siteimprove/alfa-jest",
            "@siteimprove/alfa-unexpected",
          ],
        },
        {
          name: "Components libraries",
          children: [
            "@siteimprove/alfa-angular",
            "@siteimprove/alfa-cheerio",
            "@siteimprove/alfa-enzyme",
            "@siteimprove/alfa-react",
            "@siteimprove/alfa-vue",
          ],
        },
      ],
    },
    {
      name: "Understanding the web",
      children: [
        {
          name: "Infrastructure",
          children: [
            "@siteimprove/alfa-http",
            "@siteimprove/alfa-url",
            "@siteimprove/alfa-web",
          ],
        },
        {
          name: "CSS syntax",
          children: ["@siteimprove/alfa-css", "@siteimprove/alfa-media"],
        },
        {
          name: "HTML",
          children: ["@siteimprove/alfa-dom", "@siteimprove/alfa-table"],
        },
        {
          name: "CSS",
          children: [
            "@siteimprove/alfa-cascade",
            "@siteimprove/alfa-selector",
            "@siteimprove/alfa-style",
          ],
        },
        "@siteimprove/alfa-aria",
        "@siteimprove/alfa-compatibility",
        "@siteimprove/alfa-device",
        "@siteimprove/alfa-iana",
        "@siteimprove/alfa-xpath",
      ],
    },
  ],
};
