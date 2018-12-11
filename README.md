[open an issue]: https://github.com/siteimprove/alfa/issues/new "Open a new issue"

# <img alt="Alfa" src="media/logo.svg" height="40">

> :wheelchair: Suite of open and standards-based tools for performing reliable accessibility conformance testing at scale

[![Build Status](https://semaphoreci.com/api/v1/siteimprove/alfa/branches/master/badge.svg)](https://semaphoreci.com/siteimprove/alfa)

Alfa is an open and standards-based accessibility conformance testing engine used for testing websites built using HTML, CSS, and JavaScript against accessibility standards such as the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG/). It is the result of distilling the best parts of Siteimprove's proprietary accessibility conformance testing engine and implementing them on top of the open [Accessibility Conformance Testing (ACT) Rules Format](https://www.w3.org/TR/act-rules-format/). In comparison to Siteimprove's proprietary engine, Alfa also brings several improvements that make it possible to implement and execute advanced rules without relying on Siteimprove infrastructure.

> :warning: Alfa is still in the very early stages of development. Nothing is final, nothing is published, and breaking API changes are swift and unforgiving. You should however not let it deter you from exploring the project and some of the new ideas we're trying to bring to the table.

## Contents

- [Goals](#goals)
- [Usage](#usage)
- [Integrations](#integrations)
- [Requirements](#requirements)
- [Building](#building)
- [Architecture](#architecture)
- [Funding](#funding)
- [License](#license)

## Goals

- Alfa sets out to strike a balance between false positives and negatives with the goal of having result sets reach a high [F<sub>1</sub> score](https://en.wikipedia.org/wiki/F1_score). If a false positive is encountered, it is therefore just as important to avoid introducing a potential false negative as it is fixing the false positive.

- Alfa is committed to complete transparency on how test results came to be. Every line of code that has the potential to influence test results will therefore always reside within Alfa itself and never with a third-party. However, this does not mean that Alfa does not rely on third-party dependencies, only that there are limitations to what third-party dependencies may be used for.

- Alfa wants to foster a thriving ecosystem with people from many different backgrounds contributing where they can. To this end, high-quality documentation is paramount to the success of Alfa. Picking up and contributing to any one of the many subsystems within Alfa should be a straightforward experience with every subsystem clearly stating its purpose and structure.

## Usage

Alfa is distributed as a set of separate packages that can be installed via your favourite [npm](https://www.npmjs.com/)-compatible package manager:

```console
$ npm install @siteimprove/alfa-<package-name>
```

On their own, each of these packages do very little, but when put together they provide a full suite of tools for performing accessibility comformance testing across all stages of the content development and publication workflow. If you are looking for an easy way to started using Alfa, check out the section on [integrations](#integrations); we might already have a ready-made solution for you!

At a high level, Alfa consumes implementations of rules specified in the [Accessibility Conformance Testing (ACT) Rules Format](https://www.w3.org/TR/act-rules-format/) and produces audit results in the [Evaluation and Report Language (EARL) Schema](https://www.w3.org/TR/EARL10-Schema/) encoded as [JSON-LD](https://www.w3.org/TR/json-ld/). More often than not, your only interaction with Alfa will look similar to this:

```ts
import { audit, toJson } from "@siteimprove/alfa-act";

const aspects = { ... };
const rules = [ ... ];

const results = audit(aspects, rules);
const json = toJson(rules, results, aspects);
```

Alfa is completely pluggable with regards to rules and only prescribes the implementation format. As such, there is nothing to configure when it comes to rules; simply pass in the rules you wish to run and results will be provided for those rules. To get you started, Alfa ships with a solid set of rules based on the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG/):

```ts
import { audit } from "@siteimprove/alfa-act";
import { Rules } from "@siteimprove/alfa-wcag";

const aspects = { ... };

const results = audit(aspects, Rules);
```

The last piece we are missing is aspects. Aspects are the individual parts that make up the content we wish to audit, from the HTTP request sent by a browser to fetch the content, the HTTP response supplied by the server with a chunk of HTML, the DOM constructed by the browser from this HTML, and more. Which specific aspects that need to be supplied when running an audit will depend on the rules that are part of the audit as each rule specifies which aspects it requires. To get you started, Alfa ships with a scraper that will simply fetch _all_ aspects of a given piece of content:

```ts
import { audit } from "@siteimprove/alfa-act";
import { Rules } from "@siteimprove/alfa-wcag";
import { Scraper } from "@siteimprove/alfa-scrape";

const scraper = new Scraper();

scraper
  .scrape("https://example.com")
  .then(aspects => {
    const results = audit(aspects, Rules);
  })
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    scraper.close();
  });
```

## Integrations

Alfa ships with several ready-made integrations to various tools, making it easy and simple to integrate accessibility conformance testing as part of your development workflow.

| Package                                                      | Integrates with                                    | Description                                                  |
| :----------------------------------------------------------- | :------------------------------------------------- | :----------------------------------------------------------- |
| [**@siteimprove/alfa-chai**](packages/alfa-chai)             | [Chai](https://www.chaijs.com/)                    | Chai accessibility assertions for plain DOM nodes            |
| [**@siteimprove/alfa-enzyme**](packages/alfa-enzyme)         | [Enzyme](https://github.com/airbnb/enzyme)         | Enzyme wrapper integration for supported assertion libraries |
| [**@siteimprove/alfa-jest**](packages/alfa-jest)             | [Jest](https://jestjs.io/)                         | Jest accessibility assertions for plain DOM nodes            |
| [**@siteimprove/alfa-react**](packages/alfa-react)           | [React](https://reactjs.org/)                      | React element integration for supported assertion libraries  |
| [**@siteimprove/alfa-should**](packages/alfa-should)         | [Should.js](https://github.com/shouldjs/should.js) | Should.js accessibility assertions for plain DOM nodes       |
| [**@siteimprove/alfa-unexpected**](packages/alfa-unexpected) | [Unexpected](http://unexpected.js.org/)            | Unexpected accessibility assertions for plain DOM nodes      |

If you have suggestions for additional integerations, feel free to [open an issue][]! We are always looking for new places where Alfa can be put to good use.

## Requirements

Alfa will run in any [ECMAScript 2015](https://www.ecma-international.org/ecma-262/6.0/) compatible JavaScript environment including, but not limited to, recent versions of [Node.js](https://nodejs.org/en/), [Chrome](https://www.google.com/chrome/), [Firefox](https://www.mozilla.org/en-US/firefox/), [Safari](https://www.apple.com/lae/safari/), and [Edge](https://www.microsoft.com/en-us/windows/microsoft-edge). While it should be possible to [build](#building) Alfa from source targeting older environments, we do not explicitly provide support for doing so as Alfa is highly reliant on especially data structures introduced in newer versions of ECMAScript.

## Building

In order to build Alfa, a recent version (>= 9) of [Node.js](https://nodejs.org/) is required in addition to the [Yarn](https://yarnpkg.com/) package manager. For builds, [npm](https://www.npmjs.com/) is **not** supported as Alfa makes use of [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/). Once Node.js and Yarn are installed, go ahead and install the Alfa development dependencies:

```console
$ yarn install
```

The above also performs an initial build of Alfa. When done, you can start a file watcher that watches source files for changes and kick off the associated build steps when they change:

```console
$ yarn start
```

As new code is pulled from the repository, changes to dependencies and code may require you to run the installation again or, if only code has changed, a full build:

```console
$ yarn prepare
```

If you would like to contribute to Alfa, make sure to check out the [contribution guidelines](CONTRIBUTING.md). If you have any questions, you are also welcome to [open an issue][].

## Architecture

At its core, Alfa is built around a tree structure that mirrors a subset of the [Document Object Model (DOM)](https://www.w3.org/TR/dom) and [CSS Object Model (CSSOM)](https://www.w3.org/TR/cssom/) interfaces. This tree structure can be created statically from an HTML document and associated CSS style sheets, or it can be extracted from within a browser to also provide executing of JavaScript. Anything else that a browser would typically provide, such as querying elements or computing styles, Alfa implements according to the corresponding W3C specifications.

By implementing browser aspects, such as a style system and the accessibility tree, directly within Alfa, we gain the ability to do some things that would otherwise not be possible had we relied on only the APIs provided by the browser. The most radical difference is perhaps the computation of CSS properties, where Alfa can follow declared CSS properties up through cascade, inheritance, and absolutisation.

At the code level, Alfa is structured as a monolithic repository consisting of several packages that each have their own area of responsibility. You can find more information on the overall architecture of Alfa in the [architecture documentation](docs/architecture). We also write and maintain [architecture decision reports](docs/architecture/decisions) if you want to get the complete picture of how Alfa came to be.

## Funding

[<img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" height="96" align="right" alt="European emblem">](https://ec.europa.eu/)

Alfa is part of a project that has received funding from the European Union's [Horizon 2020 research and innovation programme](https://ec.europa.eu/programmes/horizon2020/) under [grant agreement Nº780057](https://cordis.europa.eu/project/rcn/213106_en.html). We would like to give thanks to the European Commission for their grant, as well as all European citizens, who have indirectly contributed to making Alfa possible. You rock! :raised_hands:

## License

Copyright &copy; 2017-2018 [Siteimprove A/S](https://siteimprove.com/). Released under the terms of the [MIT license](LICENSE.md).
