# <img alt="Alfa" src="media/logo.svg" height="40">

> :wheelchair: Suite of open and standards-based tools for performing reliable accessibility conformance testing at scale

Alfa is an open and standards-based accessibility conformance testing engine. It is used for testing websites built using HTML, CSS, and JavaScript against accessibility standards such as the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG/). Alfa is the result of distilling the best parts of Siteimprove's proprietary accessibility conformance testing engine, which Alfa has replaced, and implementing them on top of the open [Accessibility Conformance Testing (ACT) Rules Format](https://www.w3.org/TR/act-rules-format/). It also brings several improvements that make it possible to implement and execute advanced rules without relying on Siteimprove infrastructure.

## Contents

- [Goals](#goals)
- [Usage](#usage)
- [Examples](#examples)
- [Command Line Interface](#command-line-interface)
- [Integrations](#integrations)
- [Requirements](#requirements)
- [Building](#building)
- [Experimenting](#experimenting)
- [Architecture](#architecture)
- [Funding](#funding)
- [License](#license)

## Goals

1. Alfa sets out to strike a balance between false positives and negatives with the goal of having result sets reach a high [F<sub>1</sub> score](https://en.wikipedia.org/wiki/F1_score). If a false positive is encountered, it is therefore just as important to avoid introducing a potential false negative as it is fixing the false positive.

2. Alfa is committed to complete transparency on how test results came to be. Every line of code that has the potential to influence test results will therefore always reside within Alfa itself and never with a third-party. However, this does not mean that Alfa does not rely on third-party dependencies, only that there are limitations to what third-party dependencies may be used for.

3. Alfa wants to foster a thriving ecosystem with people from many different backgrounds building on top of the core capabilities of Alfa. To this end, high-quality documentation is paramount to success. Picking up and putting any one of the many subsystems within Alfa to use should be a straightforward experience with every subsystem clearly stating its purpose and structure. **This goal is currently far from met and will be prioritised**.

## Usage

Alfa is distributed through [GitHub Packages](../../packages) as a set of separate packages that can be installed via your favourite [npm](https://www.npmjs.com/)-compatible package manager:

```console
$ npm install @siteimprove/alfa-<package-name>
```

> :warning: Make sure to instruct your client to pull packages belonging to the `@siteimprove` scope from GitHub by adding the line `@siteimprove:registry=https://npm.pkg.github.com/siteimprove` to your `.npmrc` file. See [Installing a package from Github registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package) for details.

On their own, each of these packages do very little, but when put together they provide a full suite of tools for performing accessibility comformance testing across all stages of the content development and publication workflow. If you are looking for an easy way to started using Alfa, check out the section on [integrations](#integrations); we might already have a ready-made solution for you!

At a high level, Alfa consumes implementations of rules specified in the [Accessibility Conformance Testing (ACT) Rules Format](https://www.w3.org/TR/act-rules-format/) and produces audit results in the [Evaluation and Report Language (EARL) Schema](https://www.w3.org/TR/EARL10-Schema/) encoded as [JSON-LD](https://www.w3.org/TR/json-ld/). 

### Examples

A list of curated examples of usage can be found in the [Alfa examples](https://github.com/Siteimprove/alfa-examples) repository.

Here is an overview of some basic Alfa usage. Please note that these are TypeScript snippets that needs to be built into JavaScript code before being run. 

Your first interaction with Alfa will likely be similar to this:

```ts
import { Audit, Rule } from "@siteimprove/alfa-act";

const input: I;
const rules: Iterable<Rule<I, T, Q>>;

const outcomes = await Audit.of(input, rules).evaluate();
```

Alfa is completely pluggable in regard to rules and only prescribes the implementation format. As such, there is nothing to configure when it comes to rules; simply pass in the rules you wish to run and results will be provided for those rules. To get you started, Alfa ships with a solid set of rules based on the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG/). Check the [Alfa hub](https://alfa.siteimprove.com) for details of these rules. They can simply be used as:

```ts
import { Audit } from "@siteimprove/alfa-act";

import rules from "@siteimprove/alfa-rules";

const input: I;

const outcomes = await Audit.of(input, rules).evaluate();
```

The last piece we are missing is input. Which specific input that needs to be supplied when running an audit will depend on the rules that are part of the audit as each rule specifies the input it requires. For the default WCAG rule set, the input will be a web page. To get you started, Alfa ships with a scraper that given a URL will fetch a representation of the page that can be used as input to the default rules:

```ts
import { Audit } from "@siteimprove/alfa-act";
import { Scraper } from "@siteimprove/alfa-scraper";

import rules from "@siteimprove/alfa-rules";

Scraper.with(async (scraper) => {
  for (const input of await scraper.scrape("http://example.com")) {
    const outcomes = await Audit.of(input, rules).evaluate();
  }
});
```

If you need to audit multiple pages across a site, but don't necessarily know the URL of each page beforehand, Alfa also ships with a crawler that builds on the scraper to discover and scrape linked pages:

```ts
import { Audit } from "@siteimprove/alfa-act";
import { Frontier } from "@siteimprove/alfa-frontier";
import { Crawler } from "@siteimprove/alfa-crawler";

import rules from "@siteimprove/alfa-rules";

const frontier = Frontier.of("http://example.com");

Crawler.with(async (crawler) => {
  for await (const result of crawler.crawl(frontier)) {
    for (const input of result) {
      const outcomes = await Audit.of(input, rules).evaluate();
    }
  }
});
```

For more complex use cases, please check the [Alfa examples](https://github.com/Siteimprove/alfa-examples) repository. It shows how to use Alfa to test components or full web pages; how to filter outcomes based on conformance level, WCAG version, or more; how to interact with pages (e.g. open a menu) before running an audit; how to answer questions asked by Alfa (`cantTell` outcomes); or how to add custom rules to the default rule set.

## Command Line Interface

Alfa ships with a Command Line Interface, making it easy to audit a single page. The CLI lives in the [Alfa integrations][] repository.

## Integrations

Alfa ships with several ready-made integrations to various tools, making it easy and simple to integrate accessibility conformance testing as part of your development workflow. If you have suggestions for additional integerations, feel free to [open an issue][]! We are always looking for new places where Alfa can be put to good use. Integrations live in the [Alfa integrations][] repository.

> :warning: The integrations are still experimental and subject to change.

## Requirements

Alfa will run in any [ECMAScript 2020](https://262.ecma-international.org/11.0/) compatible JavaScript environment including, but not limited to, recent versions of [Node.js][], [Chrome](https://www.google.com/chrome/), [Firefox](https://www.mozilla.org/en-US/firefox/), [Safari](https://www.apple.com/lae/safari/), and [Edge](https://www.microsoft.com/en-us/windows/microsoft-edge). While it should be possible to [build](#building) Alfa from source targeting older environments, we do not explicitly provide support for doing so as Alfa is reliant on data structures introduced in newer versions of ECMAScript.

## Building

In order to build Alfa, a recent version (>= 14) of [Node.js][] is required in addition to the [Yarn](https://yarnpkg.com/) package manager. Once Node.js and Yarn are installed, go ahead and install the Alfa development dependencies:

```console
$ yarn install
```

When done, you can start a watcher that watches source files for changes and kicks off the associated build steps when they change:

```console
$ yarn watch
```

Note that when the watcher is started it will also perform a build, which can take a bit of time if the project has not been built before.

As new code is pulled from the repository, changes to dependencies and code may require you to run the installation again or, if only code has changed, a build:

```console
$ yarn build
```

If you want to run tests and make sure everything is working, use:

```console
$ yarn test
```

When working on a specific package, you can run only these tests:

```console
$ yarn test packages/alfa-<package-name>
```

If you would like to contribute to Alfa, make sure to check out the [contribution guidelines](docs/contributing.md). If you have any questions, you are also welcome to [open an issue][].

## Experimenting

The special [`scratches`](scratches) directory is reserved for _scratch files_, which are useful for quickly running small code examples or even larger experiments. The directory is primed with a TypeScript configuration that sets up the needed project references and compiler options. All files within the directory, with the exception of the TypeScript configuration, are ignored by version control and so any files may be added without risk of them being checked into version control.

To create a new scratch file, add a new TypeScript file anywhere in the [`scratches`](scratches) directory, such as `scratches/foo.ts`, and do:

```console
$ yarn build scratches
```

You can then run the built output of your scratch file in any supported JavaScript runtime, such as [Node.js][]:

```console
$ node scratches/foo.js
```

The scratch files are built with the rest of Alfa as per the previous section. When switching between branches, you may experience one or the other scratch file not compiling. To build _just_ the Alfa packages and not the scratch files, you can do:

```console
$ yarn build packages
```

The scratches configuration includes the JSX parser from `@siteimprove/alfa-dom`. So you can create a `.tsx` file and use JSX syntax directly to create Alfa DOM objects.

## Architecture

At its core, Alfa is built around a tree structure that mirrors a subset of the [Document Object Model (DOM)](https://dom.spec.whatwg.org/) and [CSS Object Model (CSSOM)](https://www.w3.org/TR/cssom/) interfaces. This tree structure can be created statically from an HTML document and associated CSS style sheets, or it can be extracted from within a browser to also provide executing of JavaScript. Anything else that a browser would typically provide, such as querying elements or computing styles, Alfa implements according to the corresponding specifications.

By implementing browser aspects, such as a style system and the accessibility tree, directly within Alfa, we gain the ability to do some things that would otherwise not be possible had we relied on only the APIs provided by the browser. The most radical difference is perhaps the computation of CSS properties, where Alfa can follow declared CSS properties up through cascade, inheritance, and absolutisation.

At the code level, Alfa is structured as a monolithic repository consisting of several packages that each have their own area of responsibility. You can find more information on the overall architecture of Alfa in the [architecture documentation](docs/architecture). We also write and maintain [architecture decision reports](docs/architecture/decisions) if you want to get the complete picture of how Alfa came to be.

## Guides

A list of guides on how to develop with Alfa can be found under [guides](docs/guides).

## Funding

[<img src="media/europe.svg" height="96" align="right" alt="European emblem">](https://ec.europa.eu/)

Alfa is part of a project that has received funding from the European Union's [Horizon 2020 research and innovation programme](https://ec.europa.eu/programmes/horizon2020/) under [grant agreement Nº780057](https://cordis.europa.eu/project/id/780057). We would like to give thanks to the European Commission for their grant, as well as all European citizens, who have indirectly contributed to making Alfa possible. You rock! :raised_hands:

## License

Copyright &copy; [Siteimprove A/S](https://siteimprove.com/). Released under the terms of the [MIT license](LICENSE.md).

[alfa integrations]: https://github.com/Siteimprove/alfa-integrations
[open an issue]: ../../issues/new/choose "Open a new issue"
[node.js]: https://nodejs.org/en/
